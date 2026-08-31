from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass(frozen=True)
class RawArticle:
    source: str
    title: str
    url: str
    summary: str = ""
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None


@dataclass(frozen=True)
class NormalizedArticle:
    source: str
    title: str
    url: str
    summary: str
    image_url: Optional[str]
    published_at: str

    def as_api_dict(self) -> dict:
        return {
            "source": self.source,
            "title": self.title,
            "url": self.url,
            "summary": self.summary,
            "imageUrl": self.image_url,
            "publishedAt": self.published_at,
        }


@dataclass(frozen=True)
class CrawlResult:
    articles: list[RawArticle]
    pages_crawled: int
    available_pages: int
    watermark_reached: bool
    missing_dates: int
    chronology_valid: bool
