"""add total rounds and bluff statistics

Revision ID: 7ae6b30e388a
Revises: c8cfdeeacbcb
Create Date: 2026-09-17 12:04:30.685879
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7ae6b30e388a"
down_revision: Union[str, Sequence[str], None] = "c8cfdeeacbcb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add variable rounds and bluff statistics."""

    op.add_column(
        "game_player_results",
        sa.Column(
            "bluff_votes_received",
            sa.Integer(),
            server_default=sa.text("0"),
            nullable=False,
        ),
    )

    op.create_check_constraint(
        "check_game_player_result_bluff_votes",
        "game_player_results",
        "bluff_votes_received >= 0",
    )

    # The temporary default fills old games.
    op.add_column(
        "games",
        sa.Column(
            "total_rounds",
            sa.Integer(),
            server_default=sa.text("10"),
            nullable=False,
        ),
    )

    # New games must explicitly provide total_rounds.
    op.alter_column(
        "games",
        "total_rounds",
        server_default=None,
    )

    op.create_check_constraint(
        "check_game_total_rounds",
        "games",
        "total_rounds > 0",
    )

    # Player count is not limited to four.
    op.drop_constraint(
        "check_game_player_result_rank",
        "game_player_results",
        type_="check",
    )

    op.create_check_constraint(
        "check_game_player_result_rank",
        "game_player_results",
        "final_rank >= 1",
    )


def downgrade() -> None:
    """Restore the previous schema."""

    op.drop_constraint(
        "check_game_player_result_rank",
        "game_player_results",
        type_="check",
    )

    op.create_check_constraint(
        "check_game_player_result_rank",
        "game_player_results",
        "final_rank BETWEEN 1 AND 4",
    )

    op.drop_constraint(
        "check_game_total_rounds",
        "games",
        type_="check",
    )

    op.drop_column(
        "games",
        "total_rounds",
    )

    op.drop_constraint(
        "check_game_player_result_bluff_votes",
        "game_player_results",
        type_="check",
    )

    op.drop_column(
        "game_player_results",
        "bluff_votes_received",
    )