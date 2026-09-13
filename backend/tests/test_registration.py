import asyncio
import unittest
from unittest.mock import patch

import httpx
from fastapi import FastAPI

from authentication.auth import auth_router
from authentication.memory_store import TEST_USERS
from authentication.security import verify_password


class RegistrationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.original_users = TEST_USERS.copy()
        TEST_USERS.clear()
        app = FastAPI()
        app.include_router(auth_router)
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        )
        self.payload = {
            "username": "TestUser123",
            "email": "test@example.com",
            "password": "ExamplePass123!xyz",
        }

    async def asyncTearDown(self):
        await self.client.aclose()
        TEST_USERS[:] = self.original_users

    async def test_registration_hashes_password_and_returns_public_fields(self):
        response = await self.client.post("/auth/register", json=self.payload)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(set(response.json()), {"id", "username", "email"})
        user = TEST_USERS[0]
        self.assertNotIn("password", user)
        self.assertTrue(user["password_hash"].startswith("$argon2id$"))
        self.assertTrue(verify_password(self.payload["password"], user["password_hash"]))
        self.assertFalse(verify_password("WrongPassword", user["password_hash"]))

    async def test_duplicate_username_or_email(self):
        await self.client.post("/auth/register", json=self.payload)
        for changes in ({}, {"email": "other@example.com"}, {"username": "OtherUser"}):
            with self.subTest(changes=changes):
                response = await self.client.post(
                    "/auth/register", json=self.payload | changes
                )
                self.assertEqual(response.status_code, 409)
        self.assertEqual(len(TEST_USERS), 1)

    async def test_invalid_requests_do_not_create_users(self):
        cases = [
            {"username": ""}, {"username": "Ab"}, {"username": "A" * 31},
            {"username": "1User"}, {"username": "User_name"},
            {"email": "invalid"}, {"password": "Short1!"},
            {"password": "Aa1!" + "x" * 125},
            {"password": "examplepass123!xyz"},
            {"password": "EXAMPLEPASS123!XYZ"},
            {"password": "ExamplePassword!xyz"},
            {"password": "ExamplePass123xyz"},
            {"password": "ExamplePass123! xyz"},
        ]
        for changes in cases:
            with self.subTest(changes=changes):
                response = await self.client.post(
                    "/auth/register", json=self.payload | changes
                )
                self.assertEqual(response.status_code, 422)
        self.assertEqual(TEST_USERS, [])

    async def test_simultaneous_duplicates_create_only_one_user(self):
        # Ensure both requests pass their initial check before hashing completes.
        both_hashing = asyncio.Event()
        calls = 0

        async def delayed_hash(*args):
            nonlocal calls
            calls += 1
            if calls == 2:
                both_hashing.set()
            await asyncio.wait_for(both_hashing.wait(), timeout=5)
            return "test-hash"

        with patch("authentication.auth.run_in_threadpool", delayed_hash):
            responses = await asyncio.gather(
                self.client.post("/auth/register", json=self.payload),
                self.client.post("/auth/register", json=self.payload),
            )
        self.assertEqual(sorted(r.status_code for r in responses), [201, 409])
        self.assertEqual(len(TEST_USERS), 1)
