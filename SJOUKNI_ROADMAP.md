# Sjoukni — Game Rules & Data Lead Roadmap

## Overview
This roadmap outlines what you (sjoukni) should learn and implement as the Game Rules & Data Lead for Trivia_trap. It’s ordered from immediate setup tasks to longer-term production readiness.

---

## Immediate (Day 0–1)
- Setup dev environment
  - `cd backend && make install`
  - `make run` to start FastAPI (http://localhost:8000)
- Smoke test WebSocket
  - Connect to: `ws://localhost:8000/room/test?user_id=sjoukni&user_name=Sjoukni`
- Read core backend files:
  - `backend/app/dataProcessing/ingestion.py`
  - `backend/app/engine/events.py`
  - `backend/app/engine/room_models.py`
  - `backend/app/engine/room_manager.py`

---

## Short term (1–2 weeks)
1. Learn fundamentals
   - PostgreSQL basics (DDL, indexes, transactions)
   - SQLAlchemy ORM and Alembic migrations
2. Design & implement DB
   - Tables: `questions`, `answers`, `matches`, `rounds`, `players`, `bluffs`, `votes`, `stats`
   - Create SQLAlchemy models + Alembic migration
   - Add a seeder to import questions (JSON/CSV/API)

---

## Core rules & validation (1–3 weeks)
- Learn lightweight NLP/fuzzy matching:
  - `rapidfuzz`, `python-Levenshtein`, `difflib`
- Learn profanity/sanitization: `better_profanity`, `bleach`
- Implement `validate_bluff_answer` in `backend/app/dataProcessing/ingestion.py`:
  - Normalize (case, punctuation, whitespace)
  - Exact-truth check (reject if equal to correct answer)
  - Fuzzy-similarity check (token-set or ratio threshold)
  - Profanity filter and sanitization
  - Return structured response (`is_valid`, `reason`)

---

## Scoring & statistics (2–4 weeks)
- Define scoring rules: correct-answer points, deception points, trap bonuses, tie rules
- Implement `calculate_results` to:
  - Resolve votes → identify correct choice
  - Compute score deltas for each player
  - Persist round and match results
  - Produce leaderboard and deception stats
- Add unit tests for scoring logic

---

## Integration & reliability (2–4 weeks)
- Wire DB + rules into WebSocket event flow (`process_event()` / `events.py`)
- Implement server-side timers and auto-fallbacks (auto-bluff, auto-vote)
- Handle disconnects/reconnects and keep state consistent
- Add integration tests (end-to-end with in-memory DB or test Postgres)

---

## Production readiness (ongoing)
- Dockerize Postgres + backend, add CI pipelines for migrations & tests
- Consider Redis for ephemeral match state and caching
- Add monitoring, backups, and migration strategy for question DB

---

## Recommended learning resources
- SQL & Postgres: SQLBolt, Postgres docs
- SQLAlchemy + Alembic: official docs and quickstart tutorials
- Fuzzy matching: RapidFuzz docs; tutorials on token-set/token-sort
- Profanity/sanitization: `better_profanity`, `bleach`
- Testing: `pytest` + fixtures

---

## First three hands-on tasks (prioritized)
1. Run backend and confirm WebSocket connectivity. (Immediate)
2. Implement a robust `validate_bluff_answer` in `backend/app/dataProcessing/ingestion.py`. (High impact)
3. Draft SQLAlchemy models for `questions`, `answers`, `players`, `matches` and share with `obouizi` + `eelkabia`. (Design contract)

---

## Notes
- Keep interfaces explicit: share API/WS payload schemas early with `obouizi` and `eelkabia`.
- Start small and iterate: implement simple validation + scoring first, then refine thresholds and edge cases.
- Use CI to protect scoring and validation logic (tests are essential).

---

*File created: SJOUKNI_ROADMAP.md*