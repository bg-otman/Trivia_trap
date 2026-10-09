# Trivia Trap Achievements

This file defines the current achievement rules for Trivia Trap.

## General Rule

Each achievement can unlock only once for each player.

Unlocks and current-game progress live in room memory. They are lost when the
room is deleted or the backend restarts. New games clear progress but keep
unlocks while the room exists.

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
