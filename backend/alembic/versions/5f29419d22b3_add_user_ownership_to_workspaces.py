"""add user ownership to workspaces

Revision ID: 5f29419d22b3
Revises:
Create Date: 2026-07-30 10:33:22.160713
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5f29419d22b3"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add user_id as nullable first.
    # Existing workspaces don't have an owner yet.
    op.add_column(
        "workspaces",
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # 2. Create foreign key.
    op.create_foreign_key(
        "fk_workspaces_user_id_users",
        "workspaces",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # 3. Create index.
    op.create_index(
        "ix_workspaces_user_id",
        "workspaces",
        ["user_id"],
        unique=False,
    )

    # 4. Assign existing workspaces to the first user.
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
                UPDATE workspaces
                SET user_id = :user_id
                WHERE user_id IS NULL
                """
            ),
            {"user_id": first_user_id},
        )

    # 5. Check for workspaces that still have no owner.
    remaining = connection.execute(
        sa.text(
            """
            SELECT COUNT(*)
            FROM workspaces
            WHERE user_id IS NULL
            """
        )
    ).scalar()

    if remaining:
        raise RuntimeError(
            "Cannot complete migration: "
            "existing workspaces have no user to assign them to."
        )

    # 6. Ownership is now required.
    op.alter_column(
        "workspaces",
        "user_id",
        existing_type=sa.Integer(),
        nullable=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_workspaces_user_id",
        table_name="workspaces",
    )

    op.drop_constraint(
        "fk_workspaces_user_id_users",
        "workspaces",
        type_="foreignkey",
    )

    op.drop_column(
        "workspaces",
        "user_id",
    )