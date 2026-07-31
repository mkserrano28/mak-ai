from sqlalchemy.orm import Session

from app.database.models import Workspace


def get_or_create_default_workspace(db: Session):
    workspace = (
        db.query(Workspace)
        .filter(Workspace.name == "Personal")
        .first()
    )

    if workspace:
        return workspace

    workspace = Workspace(
        name="Personal",
        icon="📁",
        color="#3B82F6",
    )

    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    return workspace