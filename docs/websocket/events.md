# WebSocket Main Events

## 1. Connection

WebSocket URL:
- ws://<backend>/room/{room_id}?token=<JWT>

Rules:
- room_id comes from the URL path.
- user identity comes from token validation during handshake.
- Do not repeat room_id in every message body.

## 2. Message Envelope

All messages use the same shape:

```json
{
  "event": "EVENT_NAME",
  "data": {}
}
```

Notes:
- event: string identifier.
- data: event payload object.
- Server is authoritative for state, timers, scores, and transitions.

## 3. Minimal Event Set

### 3.1 Client -> Server

1. START_GAME
Purpose: host starts the match.

```json
{
  "event": "START_GAME",
  "data": {}
}
```

2. SUBMIT_BLUFF
Purpose: player submits fake answer.

```json
{
  "event": "SUBMIT_BLUFF",
  "data": { "bluff_answer": "Austria" }
}
```

3. SUBMIT_VOTE
Purpose: player votes for the answer they think is true.

```json
{
  "event": "SUBMIT_VOTE",
  "data": { "choice_id": "2" }
}
```

4. CHAT_MESSAGE
Purpose: send a room chat message.

```json
{
  "event": "CHAT_MESSAGE",
  "data": { "message": "Nice bluff" }
}
```

5. UPDATE_SETTINGS
Purpose: host modifies room settings.
```json
{
  "event": "UPDATE_SETTINGS",
  "data": {
    "total_rounds": 5,
    "bluff_time": 30,
    "vote_time": 20,
    "max_players": 10
  }
}
```

6. KICK_PLAYER
Purpose: host removes a player from the room.
```json
{
  "event": "KICK_PLAYER",
  "data": { "player_id": "usr_2" }
}
```

7. LEAVE_ROOM
Purpose: Player leaves a room.
```json
{
  "event": "LEAVE_ROOM",
  "data": {}
}
```

8. NEXT_PHASE
Purpose: Host moves to the next phase.
```json
{
  "event": "NEXT_PHASE",
  "data": {}
}
```

9. GET_QUESTION
Purpose: Player requests a question from the selected category.
```json
{
  "event": "GET_QUESTION",
  "data": { "category": "Science" }
}
```

### 3.2 Server -> Client

1. LOBBY_UPDATE (broadcast)
Purpose: single lobby sync event after join/leave/settings change.
Note: is_present to indicate if a player is currently connected.

```json
{
  "event": "LOBBY_UPDATE",
  "data": {
    "round": 1,
    "host_id": "usr_1",
    "players": [
      { "id": "usr_1", "username": "alice", "is_present": true, "score": 0 }
    ],
    "settings": {
      "total_rounds": 5,
      "bluff_time": 30,
      "vote_time": 20,
      "max_players": 8
    }
  }
}
```

2. PHASE_CATEGORY (broadcast)
Purpose: category selection phase.
```json
{
  "event": "PHASE_CATEGORY",
  "data": {
    "round": 1,
    "total_rounds": 5,
    "categories": [
      { "name": "General Knowledge", "image_url": "https://example.com/general_knowledge.png" },
      { "name": "Science", "image_url": "https://example.com/science.png" },
      { "name": "History", "image_url": "https://example.com/history.png" }
    ]
  }
}
```

3. PHASE_QUESTION (broadcast)
Purpose: round starts and question is shown.

```json
{
  "event": "PHASE_QUESTION",
  "data": {
    "category": "Geography",
    "question": "Which country is known for its Alps?",
    "image_url": "https://example.com/question.png",  // can be None if no image is available for the question
    "round": 1,
    "total_rounds": 5,
    "duration": 30
  }
}
```

6. PHASE_VOTING (broadcast)
Purpose: voting starts with answer choices.

```json
{
  "event": "PHASE_VOTING",
  "data": {
    "round": 1,
    "total_rounds": 5,
    "duration": 20,
    "question": {
      "text": "Which country is known for its Alps?",
      "image_url": "https://example.com/alps.png"
    },
    "choices": [
      { "id": "1", "text": "Austria" },
      { "id": "2", "text": "Switzerland" }
    ]
  }
}
```

7. RESULTS_REVEALED (broadcast)
Purpose: reveal truth, votes, and updated scores.

```json
{
  "event": "RESULTS_REVEALED",
  "data": {
    "round": 1,
    "total_rounds": 5,
    "correct_choice_id": "2",
    "choices": [
      {
        "id": "1",
        "text": "Austria",
        "author_name": "usr_1",
        "voters": ["usr_2, usr_3"]
      },
      {
        "id": "2",
        "text": "Switzerland",
        "author_name": null,
        "voters": ["usr_1"]
      }
    ],
    "leaderboard": [
      { "username": "alice", "score": 10, "avatar_url": "https://example.com/alice.png" },
      { "username": "bob", "score": 5, "avatar_url": "https://example.com/bob.png" }
    ]
  }
}
```

7. PHASE_PODIUM (broadcast)
Purpose: final standings when match ends.

```json
{
  "event": "PHASE_PODIUM",
  "data": {
    "round": 5,
    "total_rounds": 5,
    "leaderboard": [
      { "username": "alice", "score": 18, "avatar_url": "https://example.com/alice.png" },
      { "username": "bob", "score": 12, "avatar_url": "https://example.com/bob.png" }
    ]
  }
}
```

8. CHAT_MESSAGE (broadcast)
Purpose: distribute room chat message.

```json
{
  "event": "CHAT_MESSAGE",
  "data": {
    "player" : { "id": "usr_1", "username": "alice", "avatar_url": "https://example.com/alice.png" },
    "message": "Nice bluff"
  }
}
```

9. ERROR (direct)
Purpose: action rejected.

```json
{
  "event": "ERROR",
  "data": {
    "code": "INVALID_PHASE",
    "message": "Cannot submit vote during bluff phase"
  }
}
```

10. ERROR (direct)
Purpose: notify player that their bluff was rejected.
```json
{
  "event": "ERROR",
  "data": {
    "code": "BLUFF_REJECTED",
    "message": "Your bluff answer is the correct answer, please submit a different bluff."
  }
}
```

11. BLUFF_SUBMITTED (broadcast)
Purpose: notify room that a player has submitted their bluff.
```json
{
  "event": "BLUFF_SUBMITTED",
  "data": {
    "player_id": "usr_3",
  }
}
```

12. VOTE_SUBMITTED (broadcast)
Purpose: notify room that a player has submitted their vote.
```json
{
  "event": "VOTE_SUBMITTED",
  "data": {
    "player_id": "usr_3",
  }
}
```

## 4. Recommended Error Codes

- FORBIDDEN
- ROOM_NOT_FOUND
- PLAYER_NOT_FOUND
- FULL_ROOM
- INVALID_PHASE
- BLUFF_REJECTED
- INVALID_PAYLOAD

## 5. Minimal Flow

1. Connection established (token validated in handshake).
2. Server sends LOBBY_UPDATE.
3. Host sends START_GAME.
4. Server sends PHASE_CATEGORY.
5. Player send GET_QUESTION.
6. Server sends PHASE_QUESTION.
7. Players send SUBMIT_BLUFF.
8. Server sends PHASE_VOTING.
9. Players send SUBMIT_VOTE.
10. Server sends PHASE_REVEAL.
11. Server sends PHASE_PODIUM.
12. Repeat question loop or send LOBBY_UPDATE.
