# Trivia Trap - Project Summary

## Overview
**Trivia Trap** is a real-time multiplayer game combining trivia with social deduction and bluffing mechanics. Players score points by guessing the correct answer to obscure trivia questions while trying to trick opponents with plausible fake answers.

**Status**: Early Development (v0.1.0)  
**Tech Stack**: Python 3.13+, FastAPI, WebSockets, Python State Machine

---

## Project Structure

```
Trivia_trap/
├── main.py                 # Entry point (minimal - currently just a stub)
├── pyproject.toml         # Root project config
├── README.md              # Basic project description
├── Makefile               # Build orchestration
│
└── backend/
    ├── pyproject.toml     # Backend dependencies: fastapi, websockets, python-statemachine
    ├── Makefile           # Backend build tasks (uv sync, fastapi dev)
    │
    └── app/
        ├── main.py        # FastAPI app initialization
        │
        ├── dataProcessing/
        │   ├── ingestion.py    # DEMO: Category/question data functions
        │   └── __init__.py
        │
        └── engine/
            ├── events.py       # Event handlers for game lifecycle
            ├── room_manager.py # Room connection & messaging
            ├── room_models.py  # Pydantic models: PlayerInfo, RoomSettings, RoomPhase FSM
            ├── utils.py        # GameError, Context classes
            └── __init__.py

docs/
└── websocket/
    └── events.md          # WebSocket protocol specification
```

---

## Core Architecture

### 1. **FastAPI Backend** (`backend/app/main.py`)
- Runs on port 8000 with live reloading
- Two REST endpoints:
  - `GET /` - Home page
  - `GET /rooms` - List available rooms with player counts and settings
- WebSocket endpoint at `/room/{room_id}` for game logic

### 2. **Room Manager** (`engine/room_manager.py`)
- **Singleton pattern**: Global `manager` instance handles all active rooms
- **Responsibilities**:
  - Accept WebSocket connections & authentication (query params for now, JWT to-do)
  - Broadcast messages to all players in a room
  - Direct messaging to individual players
  - Connection/disconnection handling
  - Player removal/kicking

### 3. **Room State Model** (`engine/room_models.py`)

**Data Structures**:
- **PlayerInfo**: name (1-15 chars), score (≥0), connection status
- **RoomSettings**: total_rounds (≥1), bluff_time, vote_time, max_players (2-10)
- **RoomPhase**: State machine with states:
  - LOBBY (initial) → CATEGORY → QUESTION → VOTE → REVEAL → PODIUM → CATEGORY (cycle)
  - Transitions: `start()` (LOBBY→CATEGORY), `cycle()`, `end()` (PODIUM→LOBBY)
- **RoomMetaData**: Holds host_id, settings, phase, current_round, active_question, correct_answer, submitted bluffs, voting results, podium scores
- **Room**: Container for metadata + players dict (indexed by player_id for fast lookup)

### 4. **Game Events** (`engine/events.py`)

**Implemented Event Handlers** (`event_handlers` dict):

1. **START_GAME** - Host initiates game (validates host permission, must be in LOBBY phase)
2. **GET_QUESTION** - Fetch trivia question from selected category
3. **SUBMIT_BLUFF** - Player submits their fake answer (validates non-truthful)
4. **SUBMIT_VOTE** - Player votes for which answer is correct
5. **GET_CATEGORIES** - Returns list of trivia categories
6. **REVEAL_RESULTS** - Calculates round results and scores
7. **PODIUM** - Display leaderboard for current round

**Not Yet Implemented:**
- NEXT_ROUND
- LEAVE_ROOM
- KICK_PLAYER
- Other admin actions

### 5. **Data Processing Layer** (`dataProcessing/ingestion.py`)

**Currently DEMO implementations** (placeholder functions):

| Function | Purpose | Current Behavior |
|----------|---------|------------------|
| `get_category_list()` | Returns available trivia categories | Hardcoded: Science, History, Geography, Sports, Entertainment, Art & Literature, Technology, Music, Movies, Television |
| `get_random_question()` | Fetch question + answers for category | Returns mock data with placeholder text |
| `validate_bluff_answer()` | Ensure bluff isn't identical to correct answer | Always returns valid (needs real validation) |
| `build_voting_choices()` | Create voting options: correct + bluff + fake answers | Constructs list with ID + text pairs |
| `calculate_results()` | Score round, determine correct answer, update leaderboard | Returns hardcoded demo scores |

---

## Game Flow (Ideal)

1. **Join/Create Room**: Players connect via WebSocket to `/room/{room_id}?user_id=X&user_name=Y`
2. **Host Starts**: Host sends `START_GAME` → room transitions LOBBY → CATEGORY
3. **Category Selection**: Server returns available categories
4. **Question Phase**: Server sends obscure trivia question
5. **Bluff Submission**: Players submit fake answers (20 sec default)
6. **Voting Phase**: Players see all answers + vote for correct one (15 sec default)
7. **Results**: Scores calculated, correct answer revealed
8. **Podium**: Leaderboard displayed
9. **Next Round**: Cycle repeats or game ends

---

## WebSocket Protocol

**Connection URL**:
```
ws://localhost:8000/room/{room_id}?user_id=abc&user_name=Alice
```

**Message Format**:
```json
{
  "event": "EVENT_NAME",
  "data": {}
}
```

**Supported Events** (see `docs/websocket/events.md`):
- Client→Server: START_GAME, SUBMIT_BLUFF, SUBMIT_VOTE, CHAT_MESSAGE, UPDATE_SETTINGS, KICK_PLAYER, LEAVE_ROOM
- Server→Client: PHASE_CATEGORY, PHASE_QUESTION, PHASE_VOTING, RESULTS_REVEALED, PHASE_PODIUM, BLUFF_SUBMITTED, VOTE_SUBMITTED, ERROR

---

## Key Missing Features / To-Dos

### High Priority:
1. **Persistent Question Database** - Replace demo `ingestion.py` with real data source (JSON, API, or DB)
2. **Event Handler Completion** - Finish implementing stub event handlers
3. **Authentication** - Integrate JWT token validation (currently using query params)
4. **WebSocket Event Processing** - Hook `process_event()` in `room_manager.py` (not yet connected)
5. **Timer Management** - Server-side timers for bluff & voting phases
6. **Auto-Progression** - Auto-advance phases when time expires

### Medium Priority:
1. **Validation Logic** - Real bluff answer validation (similarity checks to correct answer)
2. **Score Calculation** - Proper scoring algorithm for correct guesses + tricking opponents
3. **Reconnection Logic** - Better handling of player disconnects/reconnects
4. **Error Handling** - Comprehensive error messages and recovery
5. **Admin Features** - Settings update, player kick, game pause/resume

### Low Priority:
1. **Chat System** - Message broadcasting (event defined but not handled)
2. **Frontend** - Web client implementation
3. **Persistence** - Game state/score history storage
4. **Analytics** - Game statistics tracking

---

## Build & Run

### Prerequisites:
- Python 3.13+
- `uv` package manager
- FastAPI & dependencies

### Commands:
```bash
# Install dependencies
cd backend
make install

# Run development server (http://localhost:8000)
make run

# Clean virtual environment
make clean
```

### Testing WebSocket:
- Use WebSocket client (e.g., wscat, Postman, custom Python script)
- Connect to: `ws://localhost:8000/room/room1?user_id=user1&user_name=Alice`
- Send: `{"event": "START_GAME", "data": {}}`

---

## Database/External Dependencies

**Currently**: None (all data hardcoded/mocked)

**Needed**:
- Trivia question database (API or local storage)
- Optional: User/game history database
- Optional: Real-time score sync cache (Redis)

---

## Notes & Observations

1. **State Machine Implementation**: Uses `python-statemachine` library for room phase transitions
2. **WebSocket Authentication**: Currently query-param based; JWT integration needed
3. **Room Persistence**: Rooms auto-delete when last player leaves
4. **Scoring System**: To be implemented in `calculate_results()` function
5. **Code Quality**: Type hints throughout using Pydantic for validation
6. **Demo Status**: Most game logic is stubbed with placeholder implementations

---

## Contributors & Contact

Project structure suggests this is an early-stage collaborative project. No specific contributor info in repo.

---

*Last Updated: August 2026*  
*Version: 0.1.0 - Early Development*
