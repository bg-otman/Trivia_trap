# Trivia Trap working context

## Friends feature

The friends page is `/friends` (`frontend/src/app/friends/page.tsx`). Its interactive UI is `frontend/src/components/friends/friends-view.tsx`. It uses the same `DashboardShell`, dark surface colors, typography, cards, and buttons as `/dashboard`.

- The dashboard sidebar links to `/friends` from `frontend/src/components/dashboard/dashboard-sidebar.tsx`.
- The dashboard friends card in `frontend/src/components/dashboard/friends-online.tsx` loads accepted friends from the API and links to `/friends`. The backend does not expose presence, so do not claim these players are online.
- The page shows accepted friends, incoming requests, and sent requests. It can send, accept, decline, cancel, and remove using the friendship API. Searching uses an exact username lookup through `GET /users/{username}`; there is no general player search endpoint.
- The page uses `frontend/src/lib/api.ts` (`apiFetch`) so browser requests include the HttpOnly login cookie. Unauthenticated visitors get a sign-in action returning to `/friends`. Backend cookie-authenticated writes require an allowed `Origin`; local browser origins include `localhost:3000` and `127.0.0.1:3000`.
- List payloads contain `{ id: string, username: string }`. The profile lookup returns a numeric `id`, which the page converts to a string for friendship actions.

The backend implementation is in `backend/app/friendship/router.py` and `backend/app/friendship/repository.py`; its detailed contract is in `backend/app/friendship/docs/GUIDE.md`. The router is included by `backend/app/main.py`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/friends/` | Accepted friends |
| GET | `/friends/requests` | Incoming pending requests |
| GET | `/friends/requests/sent` | Outgoing pending requests; added so the UI can restore cancel controls after refresh |
| POST | `/friends/request/{user_id}` | Send request |
| POST | `/friends/accept/{sender_id}` | Accept incoming request |
| POST | `/friends/reject/{sender_id}` | Decline incoming request |
| DELETE | `/friends/request/{receiver_id}` | Cancel outgoing request |
| DELETE | `/friends/{friend_id}` | Remove friend |

Friendships are stored in PostgreSQL. The API derives the acting user from authentication, not from a caller-supplied ID. Invalid actions return 400; missing authentication returns 401. Keep route names and response shapes in sync with the frontend when changing the API.

## Verification and current limits

At feature creation, `pnpm exec tsc --noEmit`, ESLint on changed frontend files, `pnpm build`, and Python friendship syntax checks passed. The local `/friends` page returned HTTP 200 and unauthenticated `GET /friends/requests/sent` returned 401. Authenticated actions were not exercised end to end in that session. Run a signed-in browser check when changing friendship behavior.

The existing `backend/app/main.py` friendship router inclusion and `backend/app/friendship/` files were already present as uncommitted work when the page was added. Preserve unrelated user changes in those files.
