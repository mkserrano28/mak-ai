from sqlalchemy import Boolean, Column
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import func
from sqlalchemy.orm import relationship
from sqlalchemy import JSON

from app.database.database import Base


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)

    workspace_id = Column(
        Integer,
        ForeignKey("workspaces.id"),
        nullable=False,
    )

    title = Column(
        String,
        nullable=False,
        default="New Chat",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    
    workspace = relationship(
        "Workspace",
        back_populates="chats",
    )
    # One chat has many messages
    messages = relationship(
        "Message",
        back_populates="chat",
        cascade="all, delete-orphan",
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    chat_id = Column(
        Integer,
        ForeignKey("chats.id"),
        nullable=False,
    )

    role = Column(
        String,
        nullable=False,
    )

    content = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    chat = relationship(
        "Chat",
        back_populates="messages",
    )

#Workspace
class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    user = relationship(
        "User",
        back_populates="workspaces",
    )

    name = Column(
        String,
        nullable=False,
        default="Personal",
    )


    icon = Column(
        String,
        nullable=False,
        default="📁",
    )

    color = Column(
        String,
        nullable=False,
        default="#3B82F6",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    chats = relationship(
        "Chat",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )
    documents = relationship(
    "Document",
    back_populates="workspace",
    cascade="all, delete-orphan",
    )

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    workspace_id = Column(
        Integer,
        ForeignKey("workspaces.id"),
        nullable=False,
    )

    filename = Column(
        String,
        nullable=False,
    )

    filepath = Column(
        String,
        nullable=False,
    )

    filetype = Column(
        String,
        nullable=False,
    )

    filesize = Column(
        Integer,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    workspace = relationship(
        "Workspace",
        back_populates="documents",
    )

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String,
        nullable=False,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user = relationship(
        "User",
        back_populates="workflows",
    )

    workflow = Column(
        JSON,
        nullable=False,
    )
    n8n_workflow_id = Column(String, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash = Column(
        String(255),
        nullable=False,
    )

    is_verified = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    verification_code_hash = Column(
        String(255),
        nullable=True,
    )

    verification_code_expires_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    subscription_plan = Column(
        String(50),
        nullable=False,
        default="free",
    )

    subscription_status = Column(
        String(50),
        nullable=False,
        default="active",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    payment_customer_id = Column(
    String(255),
    nullable=True,
    unique=True,
    index=True,
    )

    payment_subscription_id = Column(
        String(255),
        nullable=True,
        unique=True,
        index=True,
    )

    subscription_current_period_end = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    subscription_cancel_at_period_end = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
    workspaces = relationship(
        "Workspace",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    workflows = relationship(
        "Workflow",
        back_populates="user",
        cascade="all, delete-orphan",
    )