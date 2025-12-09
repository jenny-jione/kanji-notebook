from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, timezone


class WordBase(BaseModel):
    category: Optional[List[str]] = Field(default_factory=list)

    @field_validator("category", mode="before")
    @classmethod
    def clean_category(cls, v):
        if not v:
            return []

        if isinstance(v, str):
            v = [v]

        cleaned = []
        for item in v:
            if isinstance(item, str):
                stripped = item.strip()
                if stripped and stripped not in cleaned:
                    cleaned.append(stripped)
        return cleaned


class Word(WordBase):
    word: str
    hiragana: str
    meaning: str
    korean: str
    category: Optional[List[str]] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    wrong_count: int = 0


class WordUpdate(WordBase):
    word: str
    hiragana: str
    meaning: str
    korean: str
    category: Optional[List[str]] = Field(default_factory=list)
    updated_at: Optional[datetime] = None
    wrong_count: Optional[int] = None


class WordResponse(Word):
    id: int

    class Config:
        from_attributes = True
