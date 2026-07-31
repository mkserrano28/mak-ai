"""add subscription payment fields

Revision ID: e9a1d3bb2e0c
Revises: 1227e5fe58b7
Create Date: 2026-07-30 13:38:54.838383

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e9a1d3bb2e0c'
down_revision: Union[str, Sequence[str], None] = '1227e5fe58b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column(
            'payment_customer_id',
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        'users',
        sa.Column(
            'payment_subscription_id',
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        'users',
        sa.Column(
            'subscription_current_period_end',
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.add_column(
        'users',
        sa.Column(
            'subscription_cancel_at_period_end',
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.create_index(
        op.f('ix_users_payment_customer_id'),
        'users',
        ['payment_customer_id'],
        unique=True,
    )

    op.create_index(
        op.f('ix_users_payment_subscription_id'),
        'users',
        ['payment_subscription_id'],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        op.f('ix_users_payment_subscription_id'),
        table_name='users',
    )

    op.drop_index(
        op.f('ix_users_payment_customer_id'),
        table_name='users',
    )

    op.drop_column(
        'users',
        'subscription_cancel_at_period_end',
    )

    op.drop_column(
        'users',
        'subscription_current_period_end',
    )

    op.drop_column(
        'users',
        'payment_subscription_id',
    )

    op.drop_column(
        'users',
        'payment_customer_id',
    )
