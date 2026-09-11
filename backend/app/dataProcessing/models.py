from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
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