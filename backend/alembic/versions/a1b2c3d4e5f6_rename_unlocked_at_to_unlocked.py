"""rename achievement unlocked_at column

Revision ID: a1b2c3d4e5f6
Revises: 9f4c7a1b2e6d
Create Date: 2026-10-04 18:35:00.000000
"""

from typing import Sequence, Union

from alembic import op


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "9f4c7a1b2e6d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Rename the achievement boolean column."""
    op.alter_column(
        "user_achievements",
        "unlocked_at",
        new_column_name="unlocked",
    )


def downgrade() -> None:
    """Restore the previous achievement column name."""
    op.alter_column(
        "user_achievements",
        "unlocked",
        new_column_name="unlocked_at",
    )
