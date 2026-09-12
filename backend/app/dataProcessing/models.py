from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint, Index, CheckConstraint, DateTime, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )
    image_url: Mapped[str | None] = mapped_column(Text)

    translations: Mapped[list["CategoryTranslation"]] = relationship(
        back_populates="category",
        cascade="all, delete-orphan",
    )
    questions: Mapped[list["Question"]] = relationship(
        back_populates="category",
        passive_deletes=True,
    )


class CategoryTranslation(Base):
    __tablename__ = "category_translations"
    __table_args__ = (
        UniqueConstraint(
            "language_code",
            "name",
            name="uq_category_translation_language_name",
        ),
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True,
    )
    language_code: Mapped[str] = mapped_column(
        String(5),
        primary_key=True,
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    category: Mapped["Category"] = relationship(
        back_populates="translations",
    )


class Question(Base):
    __tablename__ = "questions"

    __table_args__ = (
        Index(
            "ix_questions_category_language",
            "category_id",
            "language_code",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    category_id: Mapped[int] = mapped_column(
        ForeignKey(
            "categories.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )

    language_code: Mapped[str] = mapped_column(
        String(5),
        nullable=False,
    )

    question_text: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    correct_answer: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    image_url: Mapped[str | None] = mapped_column(Text)

    category: Mapped["Category"] = relationship(
        back_populates="questions",
    )

    decoys: Mapped[list["QuestionDecoy"]] = relationship(
        back_populates="question",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class QuestionDecoy(Base):
    __tablename__ = "question_decoys"

    __table_args__ = (
        UniqueConstraint(
            "question_id",
            "decoy_text",
            name="uq_question_decoy_text",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    question_id: Mapped[int] = mapped_column(
        ForeignKey(
            "questions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    decoy_text: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    question: Mapped["Question"] = relationship(
        back_populates="decoys",
    )

class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        CheckConstraint(
            "password_hash IS NOT NULL OR google_sub IS NOT NULL",
            name="check_user_if_has_auth_method",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    username: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )

    avatar_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    password_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    google_sub: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
    )

    hosted_games: Mapped[list["Game"]] = relationship(
        back_populates="host",
    
    )

class Game(Base):
    __tablename__ = "games"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    host_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )

    language_code: Mapped[str] = mapped_column(
        String(5),
        nullable=False,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    finished_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    host: Mapped["User"] = relationship(
        back_populates="hosted_games",
    )

