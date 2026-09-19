# Trivia Trap - Technical Summary
## Game Rules & Data Lead Onboarding Document

**Project Status**: Early Development (v0.1.0)  
**Last Updated**: August 30, 2026  
**Documentation Scope**: Backend Architecture & Game Logic Foundation

---

## 1. Project Structure

### Backend Directory Tree
```
backend/
├── Makefile                  # Build automation (uv sync, fastapi dev)
├── pyproject.toml            # Dependencies & project metadata
├── uv.lock                   # Locked dependency versions
├── .venv/                    # Python virtual environment
│
└── app/
    ├── main.py               # FastAPI application entry point
    │
    ├── engine/               # Core game logic and state management
    │   ├── __init__.py
    │   ├── events.py         # Event handlers for game lifecycle (handlers registry)
    │   ├── room_manager.py   # WebSocket room management & broadcasting
    │   ├── room_models.py    # Pydantic models, state machine definition
    │   ├── utils.py          # GameError, Context classes
    │   └── __pycache__/
    │
    ├── dataProcessing/       # Data ingestion & trivia logic
    │   ├── __init__.py
    │   ├── ingestion.py      # DEMO/TODO: Category, question, scoring logic
    │   └── __pycache__/
    │
    └── __pycache__/
```

### Root Directory Structure
```
Trivia_trap/
├── Makefile                  # Root project orchestration
├── pyproject.toml            # Root dependencies (if any)
├── README.md                 # Project overview
├── PROJECT_SUMMARY.md        # High-level architecture
├── TECHNICAL_SUMMARY.md      # This document
├── SJOUKNI_ROADMAP.md        # Development roadmap
├── Team_Roles.pdf            # Team structure
├── .env.example              # Environment variables template
├── main.py                   # Minimal stub entry point
│
├── backend/                  # See above
├── docs/
│   └── websocket/
│       └── events.md         # WebSocket protocol specification
└── .git/                     # Version control repository
```

---

## 2. Database & ORM

### Current State: **NOT IMPLEMENTED**

**Status**: ❌ No SQLAlchemy models, databases, or Alembic migrations exist yet.

**Requirements for Implementation**:
- SQLAlchemy ORM models needed for:
  - **Questions** table (category, question_text, correct_answer, difficulty)
  - **Categories** table
  - **Players** table (user_id, username, email, registration_date)
  - **Game Sessions** table (room_id, host_id, start_date, end_date, status)
  - **Round Results** table (session_id, round_number, scores, votes)
  - **Bluff Submissions** table (session_id, player_id, answer, votes_received)

**Current Approach**: 
- Game data is **entirely in-memory** (stored in `RoomManager.rooms` dictionary)
- Question data is **mocked** via `dataProcessing/ingestion.py` demo functions
- No persistence layer exists between game sessions

**Recommendations for Lead**:
1. Design database schema for trivia questions with validation
2. Implement SQLAlchemy models with proper relationships
3. Set up Alembic migrations for schema versioning
4. Plan data validation rules (e.g., bluff answers cannot match correct answer)

---

## 3. Backend & WebSockets

### FastAPI Application (`backend/app/main.py`)

```python
# Current endpoints:
GET /              # Home page ("HELLO WORLD!")
GET /rooms         # Returns available rooms with player count & settings
WS  /room/{room_id}  # WebSocket connection with query params: user_id, user_name
```

### WebSocket Architecture

#### Connection Flow
1. Client connects to `ws://localhost:8000/room/{room_id}?user_id=X&user_name=Y`
2. Server accepts connection and extracts credentials from query params (TODO: JWT auth)
3. `RoomManager.connect()` joins or creates room
4. Server enters message loop waiting for events

#### Message Protocol
All messages follow standard envelope:
```json
{
  "event": "EVENT_NAME",
  "data": { "key": "value" }
}
```

#### Room Manager Core Methods

| Method | Purpose |
|--------|---------|
| `connect(ws, room_id)` | Accept WebSocket and join/create room |
| `broadcast(data, room_id, exclude)` | Send message to all players in room except optional excluded player |
| `send_to_player(data, room_id, player_id)` | Send direct message to single player |
| `remove_connection()` | Permanently remove player from room |
| `mark_disconnected()` | Temporarily mark player as offline (allows reconnection) |
| `kick(player_id, room_id)` | Force disconnect player |

#### Error Handling
Custom `GameError` class with error codes:
- `INVALID_PAYLOAD` - Malformed request
- `FULL_ROOM` - Room at max capacity
- `ROOM_NOT_FOUND` - Room doesn't exist
- `PLAYER_NOT_FOUND` - Player not in room
- `INVALID_PHASE` - Action invalid for current game phase
- `FORBIDDEN` - Permission denied (e.g., non-host action)
- `INVALID_CATEGORY` - Category doesn't exist
- `BLUFF_REJECTED` - Bluff answer invalid (e.g., matches correct answer)

Error response format:
```json
{
  "event": "ERROR",
  "data": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

### Event Handlers Registry (`engine/events.py`)

| Event (Client → Server) | Handler Function | Purpose |
|---------|------------------|---------|
| `START_GAME` | `start_game()` | Host initiates game (requires host permission) |
| `GET_QUESTION` | `get_question()` | Request question for selected category |
| `SUBMIT_BLUFF` | `submit_bluff()` | Player submits fake answer |
| `SUBMIT_VOTE` | `submit_vote()` | Player votes for which answer is correct |
| ~~NEXT_ROUND~~ | ~~next_round~~ | **TODO** |
| ~~LEAVE_ROOM~~ | ~~leave_room~~ | **TODO** |
| ~~KICK_PLAYER~~ | ~~kick_player~~ | **TODO** |
| ~~UPDATE_SETTINGS~~ | ~~update_settings~~ | **TODO** |
| ~~CHAT_MESSAGE~~ | ~~handle_chat_message~~ | **TODO** |

Server response events (Server → Client):
- `PHASE_CATEGORY` - Broadcast available categories
- `PHASE_QUESTION` - Broadcast question with timer info
- `PHASE_VOTING` - Broadcast vote choices (correct answer + all bluffs)
- `BLUFF_SUBMITTED` - Notify players of submission
- `VOTE_SUBMITTED` - Notify players of vote submission
- `RESULTS_REVEALED` - Show round results with scoring
- `PHASE_PODIUM` - Show leaderboard for round
- `PLAYER_DISCONNECTED` - Notify when player leaves
- `ERROR` - Error notification

---

## 4. Game Logic

### Game State Machine (`engine/room_models.py`)

```
RoomPhase StateMachine states:
├── LOBBY (initial state)
│   └─ start() → CATEGORY
├── CATEGORY
│   └─ cycle() → QUESTION
├── QUESTION
│   └─ cycle() → VOTE
├── VOTE
│   └─ cycle() → REVEAL
├── REVEAL
│   └─ cycle() → PODIUM
├── PODIUM
│   ├─ cycle() → CATEGORY (if rounds remain)
│   └─ end() → LOBBY (if final round)
```

**State Transitions**:
- Only `start()` moves LOBBY → CATEGORY
- Only `end()` moves PODIUM → LOBBY
- `cycle()` handles all mid-game transitions
- Comments reference planned async timer scheduling (not yet implemented)

### Room Metadata Structure

```python
class RoomMetaData:
    host_id: str                        # Player ID of room host
    settings: RoomSettings              # See below
    phase: RoomPhase                    # Current state machine state
    current_round: int = 1              # Round counter
    active_question: str | None         # Current question text
    correct_answer: str | None          # Correct answer to current question
    submitted_bluffs: dict[str, str]    # {player_id: "bluff answer"}
    fake_answers: list[str]             # Pre-generated fake answers
    voting_results: dict[str, str]      # {player_id: "choice_id voted for"}
    podium: list[dict[str, str]]        # Leaderboard [{username, score}, ...]
```

### Room Settings

```python
class RoomSettings:
    total_rounds: int = 10              # Number of rounds in game
    bluff_time: int = 20 seconds        # Time limit for submitting bluff
    vote_time: int = 15 seconds         # Time limit for voting
    max_players: int = 10               # Max concurrent players in room
```

### Player Information Model

```python
class PlayerInfo:
    ws: WebSocket                       # WebSocket connection object
    name: str                           # Player username (1-15 chars)
    score: int = 0                      # Current game score
    is_present: bool = True             # True=connected, False=temp disconnected
```

### Game Flow & Scoring

**Current Implementation (DEMO stage)**:

1. **LOBBY Phase**:
   - Players join room
   - Host can see players, but no settings modification yet
   - Host triggers `START_GAME` event

2. **CATEGORY Phase**:
   - Server broadcasts list of 10 categories (Science, History, Geography, Sports, Entertainment, Art & Literature, Technology, Music, Movies, Television)
   - Player selects category (via `GET_QUESTION`)

3. **QUESTION Phase**:
   - Question displayed with `bluff_time` countdown (default 20s)
   - Host + all players see same question
   - **TODO**: Clarify if host also submits bluff or only players
   - Players submit bluffs via `SUBMIT_BLUFF`

4. **VOTE Phase**:
   - All players see mixed answer list (correct + bluffs + fakes)
   - Players vote via `SUBMIT_VOTE`
   - Vote timer: `vote_time` seconds (default 15s)

5. **REVEAL Phase**:
   - Results calculated by `calculate_results()` function
   - Shows correct answer + who submitted each bluff + vote distribution
   - Points awarded (algorithm in `dataProcessing/ingestion.py` is demo only)

6. **PODIUM Phase**:
   - Leaderboard displayed
   - Host triggers next round or game ends

### Data Ingestion Functions (`dataProcessing/ingestion.py`)

**Status**: ALL FUNCTIONS ARE DEMO/PLACEHOLDER

| Function | Purpose | Current Implementation |
|----------|---------|----------------------|
| `get_category_list()` | Fetch available trivia categories | Returns hardcoded 10-category list |
| `get_random_question(category)` | Get question for category | Returns mock question with placeholder text |
| `validate_bluff_answer(answer)` | Validate submitted bluff | Always returns `is_valid=True` with no checks |
| `build_voting_choices()` | Assemble vote options | Combines correct answer + all bluffs + fake answers |
| `calculate_results()` | Score round & update leaderboard | Returns hardcoded demo result structure |

**Critical TODOs for Data Lead**:
- [ ] Replace demo functions with real question bank data
- [ ] Implement bluff validation (reject if matches/too-similar to correct answer)
- [ ] Design and implement scoring algorithm
- [ ] Define leaderboard calculation rules
- [ ] Implement category persistence (database)
- [ ] Add question difficulty levels & weighting

### Missing Game Logic

Commented out or not yet implemented:
- ~~`next_round()`~~ - Automatic round progression
- ~~`leave_room()`~~ - Player leaving mid-game
- ~~`kick_player()`~~ - Host removing players
- ~~`update_settings()`~~ - Changing room settings after creation
- ~~`handle_chat_message()`~~ - Room chat
- **Async timers** - Auto-transition between phases (see commented code in `events.py`)
- **Reconnection logic** - Player re-joining after disconnect

---

## 5. Dependencies

### Backend Dependencies (`backend/pyproject.toml`)

```toml
[project]
name = "backend"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = [
    "fastapi[standard]>=0.141.1",      # Web framework with async support
    "python-statemachine>=3.2.1",       # State machine for game phases
    "websockets>=17.0.1",               # WebSocket protocol support
]
```

**Key Dependencies Breakdown**:

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | ≥0.141.1 | HTTP/WebSocket server, API routing, validation |
| `python-statemachine` | ≥3.2.1 | Finite state machine for game phase management |
| `websockets` | ≥17.0.1 | Real-time bidirectional communication |

### Development Setup

**Build Tool**: `uv` (Python package manager - faster than pip)

**Key Build Commands** (`backend/Makefile`):
- `uv sync` - Install dependencies
- `fastapi dev app/main.py` - Start dev server with hot reload (port 8000)

**Python Version Requirement**: Python 3.13+

---

## 6. Architecture Diagrams

### WebSocket Message Flow

```
Client                          Server (RoomManager)          Game Logic (engine/events.py)
  │                                   │                              │
  ├─ WS Connect ─────────────────────>│                              │
  │                                   └─ accept() ─────────────────>│
  │                                   │<─ join_room() ──────────────┤
  │                                   │                              │
  ├─ {"event":"START_GAME","data":{}} ──────────────────────────>│
  │                                   │<─ process_event() ─────────>│
  │                                   │<─ start_game() ─────────────┤
  │                                   │<─ get_categories() ──────────┤
  │                                   │                              │
  │<─ broadcast() ──────────────────────────────────────────────────┤
  │ {"event":"PHASE_CATEGORY",...}                                 │
  │                                   │                              │
  ├─ {"event":"GET_QUESTION",...} ──>│──> get_question() ──────────>│
  │                                   │<─ broadcast() ───────────────┤
  │<─ {"event":"PHASE_QUESTION",...} ─│                              │
  │                                   │                              │
  ├─ {"event":"SUBMIT_BLUFF",...} ──>│──> submit_bluff() ─────────>│
  │                                   │                              │
  │<─ {"event":"BLUFF_SUBMITTED",...}─│                              │
  │                                   │                              │
  └─ [repeat VOTE/REVEAL/PODIUM cycle]                               │
```

### Data Flow: Room Persistence

```
RoomManager.rooms (in-memory dict)
    │
    └─ {room_id: Room}
        │
        ├─ meta_data: RoomMetaData
        │   ├─ phase: RoomPhase (state machine)
        │   ├─ active_question: str (from dataProcessing.get_random_question)
        │   ├─ correct_answer: str
        │   ├─ submitted_bluffs: {player_id: bluff_text}
        │   ├─ voting_results: {player_id: choice_id}
        │   └─ podium: [{username, score}]
        │
        └─ players: {player_id: PlayerInfo}
            └─ {player_id: PlayerInfo}
                ├─ ws: WebSocket
                ├─ name: str
                └─ score: int
```

---

## 7. Known Limitations & TODOs

### Critical Missing Features

| Area | Issue | Impact | Priority |
|------|-------|--------|----------|
| **Database** | No persistent storage | All data lost on server restart | HIGH |
| **Authentication** | Query params instead of JWT | Security risk | HIGH |
| **Timers** | No auto phase transitions | Manual progression required | MEDIUM |
| **Question Bank** | Demo data only | No real questions | HIGH |
| **Scoring** | Demo calculation only | Incorrect game results | HIGH |
| **Reconnection** | Basic disconnection handling | Players can't rejoin session | MEDIUM |
| **Chat** | Not implemented | No in-game communication | LOW |
| **End-to-End Test** | No test suite | Untested game flow | MEDIUM |

### Code Quality Notes

- ✅ Good: Pydantic models for validation
- ✅ Good: Custom error handling with error codes
- ✅ Good: Async/await for real-time communication
- ⚠️ TODO: Type hints in some data loader functions
- ⚠️ TODO: Comprehensive error recovery
- ⚠️ TODO: Logging system for debugging

---

## 8. Quick Start for Game Rules & Data Lead

### Immediate Tasks (Week 1)
1. **Review** the WebSocket event protocol in `docs/websocket/events.md`
2. **Define** the complete trivia question schema and validation rules
3. **Design** the scoring algorithm and leaderboard calculation
4. **Outline** database schema for questions, categories, and game results

### Medium-term (Week 2-3)
1. Implement real question data ingestion pipeline
2. Create SQLAlchemy models and migrations
3. Replace demo functions in `dataProcessing/ingestion.py` with production logic
4. Add comprehensive bluff validation rules

### Key Files to Focus On
- [backend/app/dataProcessing/ingestion.py](backend/app/dataProcessing/ingestion.py) - Where you'll implement your data logic
- [backend/app/engine/room_models.py](backend/app/engine/room_models.py) - Game state structure
- [backend/app/engine/events.py](backend/app/engine/events.py) - Event handlers (event name & data mapping)
- [docs/websocket/events.md](docs/websocket/events.md) - Protocol specification

---

## 9. Team Collaboration Points

### For Backend Developer
- Implement async timers for auto-phase transitions
- Add reconnection logic with session persistence
- Set up logging and monitoring

### For Frontend Developer
- Consume WebSocket events defined in `engine/events.py`
- Implement UI for each game phase (CATEGORY, QUESTION, VOTE, REVEAL, PODIUM)
- Handle connection/disconnection states

### For Database/DevOps
- Set up PostgreSQL or similar database
- Create SQLAlchemy ORM models
- Implement Alembic migration pipeline
- Set up connection pooling

### For Game Rules & Data Lead (YOU)
- Define questions, categories, and metadata
- Create validation rules for bluff answers
- Design and implement scoring algorithm
- Build data import/export pipelines
- Quality assurance of game logic and balance

---

## Document Metadata

- **Version**: 1.0
- **Last Updated**: August 30, 2026
- **Prepared For**: Game Rules & Data Lead
- **Source**: Analysis of v0.1.0 codebase
- **Next Review**: After completing Week 1 tasks
