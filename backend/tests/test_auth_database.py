"""Run against a dedicated PostgreSQL database (see authentication/docs/database.md)."""
import asyncio
from datetime import datetime, timedelta, timezone
import os
from pathlib import Path
import unittest
from unittest.mock import patch
from uuid import uuid4

os.environ.setdefault("JWT_SECRET_KEY", "database-integration-test-secret-at-least-32-bytes")

import httpx
import jwt
from alembic import command
from alembic.config import Config
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from authentication import password_reset, security
from dataProcessing.database import get_db
from dataProcessing.models import User
from main import app

TEST_URL = os.environ.get("AUTH_TEST_DATABASE_URL")
PASSWORD = "ExamplePassword123!"
NEW_PASSWORD = "ChangedPassword456!"


@unittest.skipUnless(TEST_URL, "Set AUTH_TEST_DATABASE_URL to a dedicated PostgreSQL test database")
class AuthDatabaseTests(unittest.IsolatedAsyncioTestCase):
    @classmethod
    def setUpClass(cls):
        config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
        config.set_main_option("sqlalchemy.url", TEST_URL.replace("%", "%%"))
        command.upgrade(config, "head")
        command.check(config)

    async def asyncSetUp(self):
        self.engine = create_async_engine(TEST_URL)
        self.sessions = async_sessionmaker(self.engine, expire_on_commit=False)

        async def test_db():
            async with self.sessions() as db:
                yield db

        app.dependency_overrides[get_db] = test_db
        self.client = httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test")
        self.email = f"{uuid4().hex}@example.com"
        self.username = "P" + uuid4().hex[:12]
        self.mail = []
        self.mail_patch = patch.object(password_reset, "send_email", side_effect=lambda *args: self.mail.append(args))
        self.mail_patch.start()
        self.env_patch = patch.dict(os.environ, {"PASSWORD_RESET_URL": "https://example.com/reset"})
        self.env_patch.start()

    async def asyncTearDown(self):
        self.env_patch.stop()
        self.mail_patch.stop()
        await self.client.aclose()
        app.dependency_overrides.clear()
        await self.engine.dispose()

    async def register(self, **changes):
        data = {"email": self.email, "username": self.username, "password": PASSWORD}
        data.update(changes)
        return await self.client.post("/auth/register", json=data)

    async def login(self, password=PASSWORD):
        return await self.client.post("/auth/login", json={"email": self.email.upper(), "password": password})

    def bearer(self, response):
        return {"Authorization": "Bearer " + response.json()["access_token"]}

    async def test_registration_login_persistence_and_duplicates(self):
        response = await self.register()
        self.assertEqual(response.status_code, 201, response.text)
        self.assertTrue(response.json()["id"].isdecimal())
        async with self.sessions() as db:
            user = await db.get(User, int(response.json()["id"]))
            self.assertNotEqual(user.password_hash, PASSWORD)
            self.assertIsNone(user.google_sub)
        # Dispose connections; the next request uses a fresh DB connection/session.
        await self.engine.dispose()
        login = await self.login()
        self.assertEqual(login.status_code, 200, login.text)
        me = await self.client.get("/auth/me", headers=self.bearer(login))
        self.assertEqual(me.json(), response.json())
        self.assertEqual((await self.login("WrongPassword123!")).status_code, 401)
        self.assertEqual((await self.register(email=self.email.upper())).status_code, 409)
        self.assertEqual((await self.register(email=f"{uuid4().hex}@example.com", username=self.username.swapcase())).status_code, 409)
        self.assertEqual((await self.client.get("/auth/me")).status_code, 401)
        now = datetime.now(timezone.utc)
        for sub, version in [("not-an-id", 0), ("9" * 30, 0), (response.json()["id"], True), (response.json()["id"], 99)]:
            token = jwt.encode({"sub": sub, "ver": version, "iat": now, "exp": now + timedelta(minutes=1)}, security.JWT_SECRET_KEY, algorithm="HS256")
            self.assertEqual((await self.client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})).status_code, 401)

    async def test_concurrent_registration_and_unicode_casefold(self):
        results = await asyncio.gather(self.register(), self.register())
        self.assertEqual(sorted(r.status_code for r in results), [201, 409])
        name = "Straße" + uuid4().hex[:7]
        self.assertEqual((await self.register(username=name, email=f"{uuid4().hex}@example.com")).status_code, 201)
        self.assertEqual((await self.register(username=name.casefold(), email=f"{uuid4().hex}@example.com")).status_code, 409)

    async def test_google_accounts_and_email_collision(self):
        claims = {"sub": uuid4().hex, "email": self.email, "email_verified": True}
        with patch("authentication.google_auth.verify_google_token", return_value=claims):
            first = await self.client.post("/auth/google", json={"credential": "test-credential"})
            second = await self.client.post("/auth/google", json={"credential": "test-credential"})
        self.assertEqual(first.status_code, 200, first.text)
        one = await self.client.get("/auth/me", headers=self.bearer(first))
        two = await self.client.get("/auth/me", headers=self.bearer(second))
        self.assertEqual(one.json()["id"], two.json()["id"])
        self.assertEqual((await self.login()).status_code, 401)
        await self.client.post("/auth/forgot-password", json={"email": self.email})
        self.assertEqual(self.mail, [])
        self.assertEqual((await self.register()).status_code, 409)
        claims["sub"] = uuid4().hex
        with patch("authentication.google_auth.verify_google_token", return_value=claims):
            self.assertEqual((await self.client.post("/auth/google", json={"credential": "test"})).status_code, 409)
        claims["email_verified"] = False
        with patch("authentication.google_auth.verify_google_token", return_value=claims):
            self.assertEqual((await self.client.post("/auth/google", json={"credential": "test"})).status_code, 401)

    async def test_reset_single_use_cooldown_and_token_revocation(self):
        await self.register()
        old_login = await self.login()
        results = await asyncio.gather(*[
            self.client.post("/auth/forgot-password", json={"email": self.email}) for _ in range(2)
        ])
        self.assertEqual([r.status_code for r in results], [202, 202])
        self.assertEqual(len(self.mail), 1)
        token = self.mail[0][2].split("#token=")[1].split()[0]
        async with self.sessions() as db:
            user = await db.scalar(select(User).where(User.email_key == self.email))
            self.assertNotEqual(user.reset_digest, token)
        await self.engine.dispose()
        results = await asyncio.gather(*[
            self.client.post("/auth/reset-password", json={"token": token, "password": NEW_PASSWORD}) for _ in range(2)
        ])
        self.assertEqual(sorted(r.status_code for r in results), [200, 400])
        self.assertEqual((await self.login()).status_code, 401)
        self.assertEqual((await self.login(NEW_PASSWORD)).status_code, 200)
        self.assertEqual((await self.client.get("/auth/me", headers=self.bearer(old_login))).status_code, 401)

    async def test_expired_reset_and_unknown_account(self):
        await self.register()
        known = await self.client.post("/auth/forgot-password", json={"email": self.email})
        unknown = await self.client.post("/auth/forgot-password", json={"email": f"{uuid4().hex}@example.com"})
        self.assertEqual(known.json(), unknown.json())
        token = self.mail[0][2].split("#token=")[1].split()[0]
        async with self.sessions() as db:
            await db.execute(update(User).where(User.email_key == self.email).values(reset_expires=datetime.now(timezone.utc) - timedelta(seconds=1)))
            await db.commit()
        response = await self.client.post("/auth/reset-password", json={"token": token, "password": NEW_PASSWORD})
        self.assertEqual(response.status_code, 400)

    async def test_login_rechecks_concurrent_password_reset(self):
        await self.register()
        original = security.run_in_threadpool

        async def verify_then_reset(*args):
            result = await original(*args)
            async with self.sessions() as db:
                await db.execute(update(User).where(User.email_key == self.email).values(auth_version=User.auth_version + 1))
                await db.commit()
            return result

        with patch.object(security, "run_in_threadpool", side_effect=verify_then_reset):
            self.assertEqual((await self.login()).status_code, 401)

    async def test_friendship_routes_use_database_users(self):
        first = await self.register()
        second = await self.register(username="P" + uuid4().hex[:12], email=f"{uuid4().hex}@example.com")
        headers = self.bearer(await self.login())
        sent = await self.client.post(f"/friends/request/{second.json()['id']}", headers=headers)
        self.assertEqual(sent.status_code, 200, sent.text)
        other_headers = {"Authorization": "Bearer " + security.create_access_token(int(second.json()["id"]), 0)}
        accepted = await self.client.post(f"/friends/accept/{first.json()['id']}", headers=other_headers)
        self.assertEqual(accepted.status_code, 200, accepted.text)
        friends = await self.client.get("/friends/", headers=headers)
        self.assertEqual(friends.json()[0]["id"], second.json()["id"])


    async def friendship_players(self):
        players = []
        for _ in range(3):
            response = await self.register(username="P" + uuid4().hex[:12], email=f"{uuid4().hex}@example.com")
            self.assertEqual(response.status_code, 201, response.text)
            uid = response.json()["id"]
            players.append((uid, {"Authorization": "Bearer " + security.create_access_token(int(uid), 0)}))
        return players

    async def test_friendship_persistence_and_permissions(self):
        (a, ah), (b, bh), (_, ch) = await self.friendship_players()
        self.assertEqual((await self.client.post(f"/friends/request/{a}", headers=ah)).status_code, 400)
        self.assertEqual((await self.client.post("/friends/request/2147483647", headers=ah)).status_code, 400)
        self.assertEqual((await self.client.post("/friends/request/999999999999", headers=ah)).status_code, 422)
        self.assertEqual((await self.client.post(f"/friends/request/{b}")).status_code, 401)
        self.assertEqual((await self.client.post(f"/friends/request/{b}", headers=ah)).status_code, 200)
        await self.engine.dispose()
        incoming = await self.client.get("/friends/requests", headers=bh)
        self.assertEqual([u["id"] for u in incoming.json()], [a])
        self.assertEqual((await self.client.post(f"/friends/accept/{a}", headers=ch)).status_code, 400)
        self.assertEqual((await self.client.post(f"/friends/accept/{b}", headers=ah)).status_code, 400)
        self.assertEqual((await self.client.delete(f"/friends/request/{a}", headers=bh)).status_code, 400)
        self.assertEqual((await self.client.post(f"/friends/accept/{a}", headers=bh)).status_code, 200)
        await self.engine.dispose()
        for headers, expected in [(ah, b), (bh, a)]:
            friends = await self.client.get("/friends/", headers=headers)
            self.assertEqual([u["id"] for u in friends.json()], [expected])
        self.assertEqual((await self.client.get("/friends/requests", headers=bh)).json(), [])
        self.assertEqual((await self.client.post(f"/friends/request/{a}", headers=bh)).status_code, 400)
        self.assertEqual((await self.client.delete(f"/friends/{a}", headers=ch)).status_code, 400)
        self.assertEqual((await self.client.delete(f"/friends/{a}", headers=bh)).status_code, 200)
        self.assertEqual((await self.client.get("/friends/", headers=ah)).json(), [])
        self.assertEqual((await self.client.post(f"/friends/request/{a}", headers=bh)).status_code, 200)

    async def test_friendship_reject_cancel_and_resend(self):
        (a, ah), (b, bh), (_, ch) = await self.friendship_players()
        await self.client.post(f"/friends/request/{b}", headers=ah)
        self.assertEqual((await self.client.post(f"/friends/reject/{a}", headers=ch)).status_code, 400)
        self.assertEqual((await self.client.post(f"/friends/reject/{a}", headers=bh)).status_code, 200)
        self.assertEqual((await self.client.get("/friends/requests", headers=bh)).json(), [])
        self.assertEqual((await self.client.post(f"/friends/request/{b}", headers=ah)).status_code, 200)
        self.assertEqual((await self.client.delete(f"/friends/request/{b}", headers=ah)).status_code, 200)
        await self.engine.dispose()
        self.assertEqual((await self.client.get("/friends/requests", headers=bh)).json(), [])
        self.assertEqual((await self.client.post(f"/friends/request/{a}", headers=bh)).status_code, 200)

    async def test_friendship_concurrent_requests_and_transitions(self):
        (a, ah), (b, bh), _ = await self.friendship_players()
        crossed = await asyncio.gather(
            self.client.post(f"/friends/request/{b}", headers=ah),
            self.client.post(f"/friends/request/{a}", headers=bh),
        )
        self.assertEqual(sorted(r.status_code for r in crossed), [200, 400])
        sender, sh, receiver, rh = (a, ah, b, bh) if crossed[0].status_code == 200 else (b, bh, a, ah)
        results = await asyncio.gather(
            self.client.post(f"/friends/accept/{sender}", headers=rh),
            self.client.delete(f"/friends/request/{receiver}", headers=sh),
        )
        self.assertEqual(sorted(r.status_code for r in results), [200, 400])
        if results[0].status_code == 200:
            await self.client.delete(f"/friends/{receiver}", headers=sh)
        same = await asyncio.gather(*[self.client.post(f"/friends/request/{b}", headers=ah) for _ in range(2)])
        self.assertEqual(sorted(r.status_code for r in same), [200, 400])
        accepts = await asyncio.gather(*[self.client.post(f"/friends/accept/{a}", headers=bh) for _ in range(2)])
        self.assertEqual(sorted(r.status_code for r in accepts), [200, 400])


if __name__ == "__main__":
    unittest.main()
