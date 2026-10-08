"""add achievement metadata

Revision ID: 8e7f2b6c1d4a
Revises: 6724f643c277
Create Date: 2026-10-04 18:15:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8e7f2b6c1d4a"
down_revision: Union[str, Sequence[str], None] = "6724f643c277"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add the metadata required by the UserAchievement model."""
    op.add_column(
        "user_achievements",
        sa.Column("description", sa.Text(), nullable=True),
    )
    op.add_column(
        "user_achievements",
        sa.Column("img", sa.String(length=50), nullable=True),
    )

    achievements = sa.table(
        "user_achievements",
        sa.column("achievement_code", sa.String(length=50)),
        sa.column("description", sa.Text()),
        sa.column("img", sa.String(length=50)),
    )
    connection = op.get_bind()
    connection.execute(
        achievements.update()
        .where(achievements.c.achievement_code == "first_game")
        .values(
            description="Play your first game",
            img="/images/achievements/first_game.png",
        )
    )
    connection.execute(
        achievements.update()
        .where(achievements.c.achievement_code == "first_win")
        .values(
            description="Win your first game",
            img="/images/achievements/first_win.png",
        )
    )
    connection.execute(
        achievements.update()
        .where(achievements.c.description.is_(None))
        .values(
            description="Development achievement",
            img="/images/achievements/default.png",
        )
    )
    connection.execute(
        achievements.update()
        .where(achievements.c.img.is_(None))
        .values(img="/images/achievements/default.png")
    )

    op.alter_column("user_achievements", "description", nullable=False)
    op.alter_column("user_achievements", "img", nullable=False)


def downgrade() -> None:
    """Remove achievement metadata."""
    op.drop_column("user_achievements", "img")
    op.drop_column("user_achievements", "description")
