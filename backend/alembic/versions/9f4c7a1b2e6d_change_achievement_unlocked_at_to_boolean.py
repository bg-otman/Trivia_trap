"""change achievement unlocked_at to boolean

Revision ID: 9f4c7a1b2e6d
Revises: 8e7f2b6c1d4a
Create Date: 2026-10-04 18:30:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9f4c7a1b2e6d"
down_revision: Union[str, Sequence[str], None] = "8e7f2b6c1d4a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert achievement unlock timestamps to an unlocked flag."""
    op.alter_column(
        "user_achievements",
        "unlocked_at",
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=False,
        server_default=None,
    )
    op.alter_column(
        "user_achievements",
        "unlocked_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.Boolean(),
        existing_nullable=False,
        server_default=sa.text("false"),
        postgresql_using="unlocked_at IS NOT NULL",
    )


def downgrade() -> None:
    """Restore timestamp-based achievement unlocks."""
    op.alter_column(
        "user_achievements",
        "unlocked_at",
        existing_type=sa.Boolean(),
        existing_nullable=False,
        server_default=None,
    )
    op.alter_column(
        "user_achievements",
        "unlocked_at",
        existing_type=sa.Boolean(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        server_default=sa.text("now()"),
        postgresql_using="now()",
    )
