from sqlalchemy import Column, Integer, String, JSON
from app.database.database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    workflow = Column(JSON)