"""Add transactional game persistence receipts.

Revision ID: a41d9e2c1001
Revises: 7ae6b30e388a
"""
from alembic import op
import sqlalchemy as sa

revision = "a41d9e2c1001"
down_revision = "7ae6b30e388a"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "game_persistence_events",
        sa.Column("game_id", sa.Uuid(), sa.ForeignKey("games.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("event_key", sa.String(80), primary_key=True),
        sa.Column("request_hash", sa.String(64), nullable=False),
        sa.Column("result", sa.JSON(), nullable=False),
    )


def downgrade():
    op.drop_table("game_persistence_events")
