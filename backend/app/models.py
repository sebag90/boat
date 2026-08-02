from datetime import datetime, date

from sqlalchemy import String, Text, ForeignKey, DateTime, Date, Boolean, LargeBinary, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class Boat(Base):
    __tablename__ = "boats"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    documents: Mapped[list["Document"]] = relationship(
        back_populates="boat", cascade="all, delete-orphan"
    )
    maintenance: Mapped[list["Maintenance"]] = relationship(
        back_populates="boat", cascade="all, delete-orphan"
    )
    todos: Mapped[list["Todo"]] = relationship(
        back_populates="boat", cascade="all, delete-orphan"
    )
    shopping: Mapped[list["ShoppingItem"]] = relationship(
        back_populates="boat", cascade="all, delete-orphan"
    )
    logbook: Mapped[list["LogEntry"]] = relationship(
        back_populates="boat", cascade="all, delete-orphan"
    )


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    boat_id: Mapped[int] = mapped_column(ForeignKey("boats.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(500), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    filename: Mapped[str | None] = mapped_column(String(500), nullable=True)
    content_type: Mapped[str | None] = mapped_column(String(200), nullable=True)
    data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    boat: Mapped[Boat] = relationship(back_populates="documents")


class Maintenance(Base):
    __tablename__ = "maintenance"

    id: Mapped[int] = mapped_column(primary_key=True)
    boat_id: Mapped[int] = mapped_column(ForeignKey("boats.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(500), default="")
    date: Mapped[date] = mapped_column(Date, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    receipt_filename: Mapped[str | None] = mapped_column(String(500), nullable=True)
    receipt_content_type: Mapped[str | None] = mapped_column(String(200), nullable=True)
    receipt_data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    boat: Mapped[Boat] = relationship(back_populates="maintenance")


class Todo(Base):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(primary_key=True)
    boat_id: Mapped[int] = mapped_column(ForeignKey("boats.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(Text)
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    file_filename: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_content_type: Mapped[str | None] = mapped_column(String(200), nullable=True)
    file_data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    boat: Mapped[Boat] = relationship(back_populates="todos")


class LogEntry(Base):
    __tablename__ = "logbook"

    id: Mapped[int] = mapped_column(primary_key=True)
    boat_id: Mapped[int] = mapped_column(ForeignKey("boats.id", ondelete="CASCADE"))
    date: Mapped[date] = mapped_column(Date, nullable=False)
    crew: Mapped[str] = mapped_column(Text, default="")
    start: Mapped[str] = mapped_column(Text, default="")
    goal: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    boat: Mapped[Boat] = relationship(back_populates="logbook")
    waypoints: Mapped[list["Waypoint"]] = relationship(
        back_populates="log_entry",
        cascade="all, delete-orphan",
        order_by="Waypoint.timestamp",
    )


class Waypoint(Base):
    __tablename__ = "waypoints"

    id: Mapped[int] = mapped_column(primary_key=True)
    log_id: Mapped[int] = mapped_column(ForeignKey("logbook.id", ondelete="CASCADE"))
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    name: Mapped[str | None] = mapped_column(String(200), nullable=True)

    log_entry: Mapped[LogEntry] = relationship(back_populates="waypoints")


class ShoppingItem(Base):
    __tablename__ = "shopping"

    id: Mapped[int] = mapped_column(primary_key=True)
    boat_id: Mapped[int] = mapped_column(ForeignKey("boats.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text, default="")
    link: Mapped[str] = mapped_column(Text, default="")
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    file_filename: Mapped[str | None] = mapped_column(String(500), nullable=True)
    file_content_type: Mapped[str | None] = mapped_column(String(200), nullable=True)
    file_data: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    boat: Mapped[Boat] = relationship(back_populates="shopping")
