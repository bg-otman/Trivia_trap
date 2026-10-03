# Authentication with PostgreSQL

Email/password accounts and Google accounts share `users`. Account storage, reset
state, and token versions persist in PostgreSQL. API user IDs remain strings, now
containing database-generated integers; old UUID tokens require signing in again.

## Start locally

The database URL remains hardcoded in `app/dataProcessing/database.py` and
`alembic.ini`:

```text
postgresql+asyncpg://admin:admin@127.0.0.1:54320/trivia_db
```

Start your PostgreSQL server with those settings. If you do not already have one,
this creates a local Docker server with a persistent volume:

```sh
docker run -d --name trivia_postgres \
  -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin -e POSTGRES_DB=trivia_db \
  -p 127.0.0.1:54320:5432 -v trivia_pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

If that container already exists, use `docker start trivia_postgres` instead.
After PostgreSQL is ready, run from `backend/`:

```sh
uv sync
uv run alembic upgrade head
make run
```

Keep the existing JWT, Google, and mail settings in `backend/.env`; the database
URL is not loaded from that file. Do not use `create_all()` in place of migrations.

## Storage details

- `authentication/repository.py` owns user queries and committed user creation.
- Request dependencies provide one async session per request.
- User identity keys use Python `casefold()` and database unique constraints.
  The migration backfills existing accounts and fails transactionally on any
  case-insensitive duplicates, which must be resolved before retrying.
- Both login methods issue the same JWT format. `/auth/me` checks the database
  user and token version. Google email collisions return 409 without linking.
- Password resets consume their digest and update the password/version in one
  conditional update. Concurrent consumption can succeed only once.
- If writing users outside the ORM, populate `username_key` and `email_key` with
  the same casefold normalization. ORM attribute validation handles this normally.
- Friendship requests and accepted relationships persist in `friendships`.
  Mutations are scoped to the authenticated sender/receiver. The unordered-pair
  unique index prevents duplicate and crossed requests under concurrency.

## Integration tests

Use a dedicated PostgreSQL test database. Tests apply migrations and create test
accounts; Google verification and SMTP sending are mocked, so no mail is sent.
From `backend/`:

```sh
AUTH_TEST_DATABASE_URL=postgresql+asyncpg://admin:admin@127.0.0.1:54321/trivia_auth_test \
  PYTHONPATH=app uv run python -m unittest discover -s tests -v
```

Without `AUTH_TEST_DATABASE_URL`, database tests are skipped. Tests check schema
consistency, both login methods, database persistence across fresh connections,
case-insensitive uniqueness, concurrent registration and reset requests, reset
expiry, token revocation, login/reset races, and friendship compatibility.
