"""add game_player_category_results table and user_achievements

Revision ID: c8cfdeeacbcb
Revises: cfec0e7f480e
Create Date: 2026-09-17 11:18:26.889063
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# Revision identifiers used by Alembic.
revision: str = "c8cfdeeacbcb"
down_revision: Union[str, Sequence[str], None] = "cfec0e7f480e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "user_achievements",
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "achievement_code",
            sa.String(length=50),
            nullable=False,
        ),
        sa.Column(
            "unlocked_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "user_id",
            "achievement_code",
        ),
    )

    op.create_table(
        "game_player_category_results",
        sa.Column(
            "game_id",
            sa.Uuid(),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "category_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "questions_played",
            sa.Integer(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.Column(
            "correct_answers",
            sa.Integer(),
            server_default=sa.text("0"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "correct_answers <= questions_played",
            name="check_player_category_valid_answers",
        ),
        sa.CheckConstraint(
            "correct_answers >= 0",
            name="check_player_category_correct_answers",
        ),
        sa.CheckConstraint(
            "questions_played >= 0",
            name="check_player_category_questions",
        ),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["categories.id"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["game_id", "user_id"],
            [
                "game_player_results.game_id",
                "game_player_results.user_id",
            ],
            name="fk_player_category_result_game_player",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "game_id",
            "user_id",
            "category_id",
        ),
    )

    op.create_index(
        "ix_player_category_results_user_category",
        "game_player_category_results",
        ["user_id", "category_id"],
        unique=False,
    )

    op.create_index(
        "uq_friendship_user_pair",
        "friendships",
        [
            sa.literal_column(
                "least(requester_id, receiver_id)"
            ),
            sa.literal_column(
                "greatest(requester_id, receiver_id)"
            ),
        ],
        unique=True,
    )

    op.create_index(
        "ix_games_host_user_id",
        "games",
        ["host_user_id"],
        unique=False,
    )

    # Prevent finished_at from preceding started_at.
    op.create_check_constraint(
        "check_game_valid_dates",
        "games",
        "finished_at IS NULL OR finished_at >= started_at",
    )

    # Replace the previous Friendship status constraint.
    op.drop_constraint(
        "check_friendship_status",
        "friendships",
        type_="check",
    )

    op.create_check_constraint(
        "check_friendship_status",
        "friendships",
        "status IN ('pending', 'accepted', 'rejected')",
    )

    op.add_column(
        "users",
        sa.Column(
            "cover_url",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "users",
        "created_at",
    )

    op.drop_column(
        "users",
        "cover_url",
    )

    # Restore the previous Friendship status constraint.
    op.drop_constraint(
        "check_friendship_status",
        "friendships",
        type_="check",
    )

    op.create_check_constraint(
        "check_friendship_status",
        "friendships",
        "status IN ('pending', 'accepted')",
    )

    op.drop_constraint(
        "check_game_valid_dates",
        "games",
        type_="check",
    )

    op.drop_index(
        "ix_games_host_user_id",
        table_name="games",
    )

    op.drop_index(
        "uq_friendship_user_pair",
        table_name="friendships",
    )

    op.drop_index(
        "ix_player_category_results_user_category",
        table_name="game_player_category_results",
    )

    op.drop_table(
        "game_player_category_results",
    )

    op.drop_table(
        "user_achievements",
    )