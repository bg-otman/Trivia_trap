"""Add persistent authentication fields

Revision ID: 6724f643c277
Revises: 7ae6b30e388a
Create Date: 2026-10-02 14:25:46.201232

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6724f643c277'
down_revision: Union[str, Sequence[str], None] = '7ae6b30e388a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('username_key', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('email_key', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('auth_version', sa.Integer(), server_default=sa.text('0'), nullable=False))
    op.add_column('users', sa.Column('reset_digest', sa.String(length=64), nullable=True))
    op.add_column('users', sa.Column('reset_expires', sa.DateTime(timezone=True), nullable=True))
    op.add_column('users', sa.Column('reset_sent_at', sa.DateTime(timezone=True), nullable=True))
    op.create_index(op.f('ix_users_reset_digest'), 'users', ['reset_digest'], unique=False)
    # Backfill with the same Unicode normalization used by authentication.
    users = sa.table('users', sa.column('id', sa.Integer()),
                     sa.column('username', sa.Text()), sa.column('email', sa.Text()),
                     sa.column('username_key', sa.Text()), sa.column('email_key', sa.Text()))
    connection = op.get_bind()
    for user in connection.execute(sa.select(users.c.id, users.c.username, users.c.email)).mappings():
        connection.execute(users.update().where(users.c.id == user['id']).values(
            username_key=user['username'].casefold(), email_key=user['email'].casefold()))
    op.alter_column('users', 'username_key', nullable=False)
    op.alter_column('users', 'email_key', nullable=False)
    # Duplicate normalized identities fail transactionally instead of merging accounts.
    op.create_unique_constraint('uq_users_username_key', 'users', ['username_key'])
    op.create_unique_constraint('uq_users_email_key', 'users', ['email_key'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('uq_users_email_key', 'users', type_='unique')
    op.drop_constraint('uq_users_username_key', 'users', type_='unique')
    op.drop_index(op.f('ix_users_reset_digest'), table_name='users')
    op.drop_column('users', 'reset_sent_at')
    op.drop_column('users', 'reset_expires')
    op.drop_column('users', 'reset_digest')
    op.drop_column('users', 'auth_version')
    op.drop_column('users', 'email_key')
    op.drop_column('users', 'username_key')
