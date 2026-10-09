# Trivia Trap Achievements

This file defines the current achievement rules for Trivia Trap.

## General Rule

Each achievement can unlock only once for each player.

New unlocks are saved in PostgreSQL before they are announced. At game start,
stored unlocks are loaded into room state, so later games and server restarts
do not announce them again. Current-game progress stays in room memory and
resets when a new game starts. A failed save is logged and the unlock is not
announced or marked as permanent in room state.

---

## 1. FIRST_CORRECT

**Unlock rule:**  
Unlock when a player votes for the correct answer for the first time.

---

## 2. FIRST_BLUFF

**Unlock rule:**  
Unlock when another player votes for that player's fake answer for the first time.

---

## 3. PERFECT_BLUFF

**Unlock rule:**  
Unlock when every eligible player in the round votes for that player's bluff.

**Extra rule:**  
The game must have at least **3 players**.

An eligible player is a player who is allowed to vote for that bluff.  
The bluff author cannot vote for their own bluff.

---

## 4. PERFECT_ROUND

**Unlock rule:**  
Unlock when, in the same round:

- the player votes for the correct answer
- at least **3 other players** vote for the player's bluff

**Extra rule:**  
The game must have at least **4 players**.

---

## 5. ROUND_STAR

**Unlock rule:**  
Unlock when the player earns at least **7 points in one round**.

---

## 6. SHARP_EYE

**Unlock rule:**  
Unlock when the player gets **5 correct answers in one game**.

---

## 7. HIGH_SCORER

**Unlock rule:**  
Unlock when the player finishes a game with at least **20 total points**.
