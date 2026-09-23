# Ft Transcendence - Database Documentation

This document explains the database for the Trivia/Bluff game, including the purpose of every table and column, the main relationships, the persistence flow, and the backend rules the team must enforce.

## 1. Database responsibility

PostgreSQL stores durable information that must survive backend restarts:

- User accounts and friendships.
- Categories, questions, and prepared incorrect answers.
- Completed games and final player results.
- Data required for match history and statistics.

Live match state stays in server RAM, or may be moved to Redis later if the application uses multiple backend workers:

- Room phase and timers.
- Current question and round number.
- Temporary player submissions.
- Votes and temporary scores.
- Randomized option order.

For this reason, the current schema does not contain tables for rounds, votes, or temporary options.

## 2. Entity relationships

~~~mermaid
erDiagram
    USERS ||--o{ GAMES : hosts
    USERS ||--o{ GAME_PLAYER_RESULTS : receives
    GAMES ||--o{ GAME_PLAYER_RESULTS : contains
    USERS ||--o{ FRIENDSHIPS : sends
    USERS ||--o{ FRIENDSHIPS : receives
    CATEGORIES ||--o{ CATEGORY_TRANSLATIONS : has
    CATEGORIES ||--o{ QUESTIONS : contains
    QUESTIONS ||--o{ QUESTION_DECOYS : has
~~~

## 3. Tables

### users

Stores the main account record for every registered user.

| Column | Purpose |
|---|---|
| **id** | Internal user identifier and primary key. |
| **username** | Public username. It must be unique and no longer than 50 characters. |
| **avatar_url** | Optional URL of the user's avatar. |
| **is_active** | When false, the account is disabled without deleting its data or history. |
| **email** | Unique email used for registration and authentication. |
| **password_hash** | Secure hash of the password, never the original password. |

Important rules:

- Never store or return the original password.
- Use Argon2 or bcrypt to generate **password_hash**.
- Normalize emails before storage, for example by converting them to lowercase.
- Prefer soft deletion with **is_active = false** to preserve match history.

### categories

Stores the language-independent identity of each question category.

| Column | Purpose |
|---|---|
| **id** | Category identifier and primary key. |
| **slug** | Stable and unique technical name, such as **football** or **video-games**. |
| **image_url** | Optional category image URL. |
| **is_active** | Allows the category to be hidden without deleting it. |

Translated category names are stored in **category_translations**, not in this table.

### category_translations

Stores one translated name for each category and language.

| Column | Purpose |
|---|---|
| **category_id** | Category being translated. |
| **language_code** | Translation language, such as **ar** or **en**. |
| **name** | Category name in the selected language. |

The composite primary key **(category_id, language_code)** guarantees one translation per category and language.

The unique index **(language_code, name)** prevents two categories from having the same name in the same language.

Deleting a category automatically deletes its translations through **ON DELETE CASCADE**.

### questions

Stores playable questions. Arabic and English questions may contain different content, so each question is an independent record.

| Column | Purpose |
|---|---|
| **id** | Question identifier and primary key. |
| **category_id** | Category containing the question. |
| **language_code** | Language of the question. |
| **question_text** | Text displayed to the players. |
| **correct_answer** | Correct answer for the question. |
| **image_url** | Optional image associated with the question. |
| **is_active** | Determines whether the question is available for selection. |

The index **(category_id, language_code)** makes question selection by category and language faster.

Important rules:

- Select only questions where **is_active = true**.
- The correct answer must be different from every decoy after applying the same text normalization.
- A category containing questions should not be hard-deleted. Disable it or handle its questions first.

### question_decoys

Stores prepared incorrect answers for each question. They are used to replace missing, duplicated, or invalid player submissions.

| Column | Purpose |
|---|---|
| **id** | Decoy identifier and primary key. |
| **question_id** | Question that owns the decoy. |
| **decoy_text** | Incorrect answer text. |

The unique index **(question_id, decoy_text)** prevents duplicate decoys for the same question.

Deleting a question automatically deletes all its decoys.

Every playable question must have at least four different decoys. The backend must verify this condition before activating a question.

### games

Each record represents one game and provides the base data required for match history.

| Column | Purpose |
|---|---|
| **id** | Globally unique game identifier stored as a UUID. |
| **host_user_id** | User who created the game. |
| **language_code** | Language selected for the game and its questions. |
| **status** | Game state: **active**, **finished**, or **cancelled**. |
| **started_at** | Time at which the game started. |
| **finished_at** | Time at which the game ended; null while it is active. |

Indexes on **host_user_id** and **status** improve queries by host and game state.

### game_player_results

Connects games to their participants and stores the final result of every player.

| Column | Purpose |
|---|---|
| **game_id** | Game associated with the result. |
| **user_id** | Player who owns the result. |
| **final_score** | Player's total score at the end of the game. |
| **final_rank** | Final position. Rank 1 means that the player won. |

The composite primary key **(game_id, user_id)** prevents the same player from being recorded twice in one game.

Deleting a game automatically deletes its results. Disabling a user does not delete their history.

The following information can be calculated from **games** and **game_player_results**:

- **Games played:** number of the player's games whose status is **finished**.
- **Games won:** number of results where **final_rank = 1**.
- **Highest score:** maximum value of **final_score**.
- **Match history:** game date, opponents, score, and final rank.
- **Leaderboard:** ranking based on wins, total score, or another agreed formula.

### friendships

Stores friend requests and accepted friendships between users.

| Column | Purpose |
|---|---|
| **requester_id** | User who sent the friend request. |
| **receiver_id** | User who received the friend request. |
| **status** | Request state: **pending**, **accepted**, or **rejected**. |
| **created_at** | Time at which the request was sent. |

The composite primary key **(requester_id, receiver_id)** prevents duplicate requests in the same direction.

The backend must also prevent:

- A user from sending a friend request to themselves.
- Reverse duplicates between the same users, such as both **A to B** and **B to A**.
- A user other than **receiver_id** from accepting or rejecting the request.

Online status is temporary and must not be stored here. It should be derived from active WebSocket connections in RAM, or from Redis in a multi-worker deployment.

## 4. Game persistence flow

1. When a game starts, create a **games** record with the **active** status.
2. Keep round details, submissions, votes, and temporary scores in RAM.
3. If the game is abandoned, change its status to **cancelled** and set **finished_at**.
4. When the game finishes successfully, insert every player's final result into **game_player_results**.
5. In the same database transaction, change the game status to **finished** and set **finished_at**.

Result insertion and game completion must use one database transaction. Either all final results are committed or no completion changes are committed.

## 5. Required backend validations

- Allow only supported language codes, such as **ar** and **en**.
- Allow only **active**, **finished**, and **cancelled** as game statuses.
- Allow only **pending**, **accepted**, and **rejected** as friendship statuses.
- Require **final_score >= 0**.
- At game completion, require **final_rank** to be between 1 and the number of players.
- The host must also be present in **game_player_results**.
- A finished game must contain one final result for every participant.
- Do not include active or cancelled games in player statistics.
- Validate uploaded image type, size, and source according to the project policy.
- Sensitive operations require authorization, not only authentication.

## 6. Deletion policy

| Operation | Expected behavior |
|---|---|
| Disable a user | Set **users.is_active = false** and preserve their results. |
| Permanently delete a user | Delete friendships, but preserve or explicitly handle match history first. |
| Delete a category | Delete its translations, but reject deletion while questions still reference it. |
| Delete a question | Automatically delete its decoys. |
| Delete a game | Automatically delete all associated player results. |

## 7. Subject compliance note

This schema supports the game, friendships, basic statistics, and match history.

Achievements, XP, and level progression are not stored yet. If the team wants to claim every part of the **Game statistics and match history** module in the subject, it must first define the achievement and progression rules, then add dedicated tables for them. These tables should not be added before their product rules are clear.
