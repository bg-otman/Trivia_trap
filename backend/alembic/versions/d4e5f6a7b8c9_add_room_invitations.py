"""add room invitations

Revision ID: d4e5f6a7b8c9
Revises: bab8d7fe719a
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, Sequence[str], None] = "bab8d7fe719a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "room_invitations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=False),
        sa.Column("room_code", sa.String(length=6), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="pending", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("status IN ('pending', 'accepted', 'declined', 'expired')", name="check_room_invitation_status"),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_room_invitations_recipient_status", "room_invitations", ["recipient_id", "status"])
    op.create_index(
        "uq_room_invitation_active", "room_invitations",
        ["sender_id", "recipient_id", "room_code"], unique=True,
        postgresql_where=sa.text("status = 'pending'"),
    )


def downgrade() -> None:
    op.drop_index("uq_room_invitation_active", table_name="room_invitations")
    op.drop_index("ix_room_invitations_recipient_status", table_name="room_invitations")
    op.drop_table("room_invitations")
