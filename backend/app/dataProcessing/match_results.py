"""Trusted participant bindings and final result construction (no I/O)."""


def record_participants(ledger, players):
    for pid, player in players.items():
        if type(player.user_id) is not int or player.user_id <= 0:
            raise ValueError("Unverified participant")
        ledger[pid] = dict(user_id=player.user_id, final_score=player.score,
                           bluff_votes_received=player.bluff_votes_received)
    if len({row["user_id"] for row in ledger.values()}) != len(ledger):
        raise ValueError("User appears more than once in a match")


def bind_achievements(unlocked, ledger):
    return {ledger[pid]["user_id"]: codes for pid, codes in unlocked.items()}


def player_achievements(saved, ledger):
    return {pid: saved[str(row["user_id"])] for pid, row in ledger.items()
            if str(row["user_id"]) in saved}


def final_player_results(ledger, players):
    """Departed participants keep earned totals, but cannot win the match."""
    active = {pid for pid in players if pid in ledger}
    results = []
    for pid, row in ledger.items():
        peers = active if pid in active else set(ledger) - active
        rank = 1 + sum(ledger[other]["final_score"] > row["final_score"] for other in peers)
        if pid not in active:
            rank += len(active)
        results.append({**row, "final_rank": rank})
    return results
