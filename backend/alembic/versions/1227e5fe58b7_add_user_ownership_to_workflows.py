"""add user ownership to workflows

Revision ID: 1227e5fe58b7
Revises: 5f29419d22b3
Create Date: 2026-07-30 11:06:33.838865

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1227e5fe58b7'
down_revision: Union[str, Sequence[str], None] = '5f29419d22b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "workflows",
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_foreign_key(
        "fk_workflows_user_id_users",
        "workflows",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_index(
        "ix_workflows_user_id",
        "workflows",
        ["user_id"],
        unique=False,
    )

    connection = op.get_bind()

    first_user_id = connection.execute(
        sa.text(
            """
            SELECT id
            FROM users
            ORDER BY id
            LIMIT 1
            """
        )
    ).scalar()

    if first_user_id is not None:
        connection.execute(
            sa.text(
                """
                UPDATE workflows
                SET user_id = :user_id
                WHERE user_id IS NULL
                """
            ),
            {
                "user_id": first_user_id,
            },
        )

    remaining = connection.execute(
        sa.text(
            """
            SELECT COUNT(*)
            FROM workflows
            WHERE user_id IS NULL
            """
        )
    ).scalar()

    if remaining:
        raise RuntimeError(
            "Cannot complete migration: "
            "existing workflows have no user."
        )

    op.alter_column(
        "workflows",
        "user_id",
        existing_type=sa.Integer(),
        nullable=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_workflows_user_id",
        table_name="workflows",
    )

    op.drop_constraint(
        "fk_workflows_user_id_users",
        "workflows",
        type_="foreignkey",
    )

    op.drop_column(
        "workflows",
        "user_id",
    )
