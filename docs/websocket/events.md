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

7. LEAVE_ROOM
Purpose: Player leaves a room.
```json
{
  "event": "LEAVE_ROOM",
  "data": { "player_id": "usr_1" }
}
```

8. NEXT_ROUND
Purpose: Host moves to the next round.
```json
{
  "event": "NEXT_ROUND",
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
    "question": "In 1923, Liechtenstein adopted which neighbor currency?",
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
      { "username": "alice", "score": 10 },
      { "username": "bob", "score": 5 }
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
      { "username": "alice", "score": 18 },
      { "username": "bob", "score": 12 }
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

10. PLAYER_DISCONNECTED (broadcast)
Purpose: notify room that a player has disconnected.
```json
{
  "event": "PLAYER_DISCONNECTED",
  "data": {
    "player_id": "usr_2",
    "player_name": "bob"
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

- UNAUTHORIZED
- FORBIDDEN
- ROOM_NOT_FOUND
- FULL_ROOM
- INVALID_PHASE
- INVALID_ACTION
- BLUFF_CORRECT
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
