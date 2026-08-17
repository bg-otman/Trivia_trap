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
  "data": { "text": "Austria" }
}
```

3. SUBMIT_VOTE
Purpose: player votes for the answer they think is true.

```json
{
  "event": "SUBMIT_VOTE",
  "data": { "choice_id": "c2" }
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
    "voting_time": 20
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

7. CHOOSE_CATEGORY
Purpose: Player select a category.
```json
{
  "event": "CHOOSE_CATEGORY",
  "data": { "category": "Science" }
}
```


### 3.2 Server -> Client

1. LOBBY_UPDATE (broadcast)
Purpose: single lobby sync event after join/leave/ready/settings change.
Note: is_present to indicate if a player is currently connected.

```json
{
  "event": "LOBBY_UPDATE",
  "data": {
    "host_id": "usr_1",
    "players": [
      { "id": "usr_1", "username": "alice", "is_present": true, "score": 0 }
    ],
    "settings": {
      "total_rounds": 5,
      "bluff_time": 30,
      "voting_time": 20,
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
    "categories": ["General Knowledge", "Science", "History"]
  }
}
```

3. PHASE_QUESTION (broadcast)
Purpose: round starts and question is shown.

```json
{
  "event": "PHASE_QUESTION",
  "data": {
    "round": 1,
    "total_rounds": 5,
    "prompt": "In 1923, Liechtenstein adopted which neighbor currency?",
    "duration": 30
  }
}
```

4. BLUFF_CORRECT (broadcast)
Purpose: a player has submitted the correct answer, need to submit a fake answer.
```json
{
  "event": "BLUFF_CORRECT",
  "data": {
    "player_id": "usr_3"
  }
}
```

5. PHASE_VOTING (broadcast)
Purpose: voting starts with answer choices.

```json
{
  "event": "PHASE_VOTING",
  "data": {
    "duration": 20,
    "choices": [
      { "id": "c1", "text": "Austria" },
      { "id": "c2", "text": "Switzerland" }
    ]
  }
}
```

6. PHASE_REVEAL (broadcast)
Purpose: reveal truth, votes, and updated scores.

```json
{
  "event": "PHASE_REVEAL",
  "data": {
    "correct_choice_id": "c2",
    "choices": [
      {
        "id": "c1",
        "text": "Austria",
        "author_id": "usr_1",
        "is_correct": false,
        "voters": ["usr_2"]
      },
      {
        "id": "c2",
        "text": "Switzerland",
        "author_id": null,
        "is_correct": true,
        "voters": ["usr_1", "usr_3"]
      }
    ],
    "leaderboard": [
      { "id": "usr_1", "username": "alice", "round_points": 1500, "total_score": 3200 }
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
    "winners": [
      { "rank": 1, "id": "usr_1", "username": "alice", "score": 8500 }
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
    "player_id": "usr_1",
    "username": "alice",
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

## 4. Recommended Error Codes

- UNAUTHORIZED
- FORBIDDEN
- ROOM_NOT_FOUND
- FULL_ROOM
- INVALID_PHASE
- INVALID_ACTION
- ALREADY_SUBMITTED
- ALREADY_VOTED
- INVALID_PAYLOAD
- RATE_LIMITED
- SERVER_ERROR

## 5. Minimal Flow

1. Connection established (token validated in handshake).
2. Server sends LOBBY_UPDATE.
3. Host sends START_GAME.
4. Server sends PHASE_CATEGORY.
5. Server sends PHASE_QUESTION.
6. Players send SUBMIT_BLUFF.
7. Server sends PHASE_VOTING.
8. Players send SUBMIT_VOTE.
9. Server sends PHASE_REVEAL.
10. Repeat question loop or send PHASE_PODIUM.
