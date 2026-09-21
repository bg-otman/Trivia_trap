# Password recovery API

## Configuration

Add these settings to `backend/.env`, alongside your existing JWT and Google settings:

```dotenv
SMTP_EMAIL=your-sender@gmail.com
SMTP_PASSWORD=YOUR_GOOGLE_APP_PASSWORD
PASSWORD_RESET_URL=https://your-frontend.example/reset-password
```

`PASSWORD_RESET_URL` is the full URL of the reset form owned by the frontend team.
Use HTTPS in deployment. Do not include a fragment (`#...`) in this setting.
It replaces `PUBLIC_BACKEND_URL`. No HTML pages are served by the authentication backend.
Missing or invalid reset-page configuration returns 503 for all forgot-password requests.
Never commit `.env`. Start the backend with `make run` from `backend`.

## API and frontend contract

- POST `/auth/forgot-password`: `{"email":"player@example.com"}`.
  Returns 202 with the same message for eligible, missing, Google-only, and cooldown-limited accounts.
- The email contains `PASSWORD_RESET_URL#token=TOKEN`.
  The frontend reads the fragment, removes it from the address bar, and collects a new password.
- POST `/auth/reset-password`: `{"token":"TOKEN_FROM_EMAIL","password":"NewPassword123!long"}`.
  Returns 200 on success, 400 for an invalid/expired/used link, or 422 for invalid input.
- After success, the user signs in normally with the new password. Previous access tokens are revoked.

For backend-only manual testing, use `/docs` to call the two POST endpoints.
Copy the token after `#token=` from the received email; a working frontend form is
not required for this API test. A real frontend form is required for users to follow the link.

## Behavior

Tokens have 256 random bits; only SHA-256 digests are stored. Tokens expire after
15 minutes, work once, and are replaced by a new request after a 60-second cooldown.
Passwords follow the registration policy. Token validity is rechecked after hashing
so concurrent requests cannot consume the same token twice. Login also rechecks
credentials after verification so a login using the old password cannot finish
after a reset and obtain a new session.

Email runs after the HTTP response using BackgroundTasks. A 202 response does not
confirm delivery. SMTP errors or missing credentials are logged without tokens or
credentials. There is no automatic retry. A successful reset also sends a password-change
notification. Google-only accounts continue to use Google sign-in.

## Development limits

Users, tokens, cooldowns, and session versions use the existing in-memory user store.
Use one backend process; restarting loses this state. Deployment still requires a
shared database with transactional token consumption and shared IP/global request
limits. The current cooldown only limits emails to each account. Use a durable email
queue if delivery retries are required.

## Tests

From `backend`, run `make test`, or:

```sh
PYTHONPATH=app uv run python -m unittest discover -s tests -v
```

`tests/test_password_reset.py` is development verification, not part of the running API.
Keep it to detect regressions. SMTP is mocked: tests never send real emails.
