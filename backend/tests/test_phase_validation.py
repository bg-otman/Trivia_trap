import pytest

from engine.room_models import RoomPhase
from engine.utils import GameError, validate_phase


@pytest.mark.parametrize(
    "phase",
    [
        RoomPhase.LOBBY,
        RoomPhase.CATEGORY,
        RoomPhase.QUESTION,
        RoomPhase.VOTE,
        RoomPhase.REVEAL,
        RoomPhase.PODIUM,
    ],
)
def test_chat_message_is_allowed_in_every_phase(phase):
    validate_phase(phase, "CHAT_MESSAGE")


def test_phase_specific_events_are_still_rejected():
    with pytest.raises(GameError, match="only next phase is allowed"):
        validate_phase(RoomPhase.REVEAL, "SUBMIT_VOTE")
