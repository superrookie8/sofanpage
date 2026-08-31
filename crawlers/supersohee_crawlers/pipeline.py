from dataclasses import dataclass
from datetime import datetime

from .classify import ClassifiedArticle, EntityDecision, classify_entity
from .models import CrawlResult
from .normalize import normalize_and_dedupe
from .policy import IdentityPolicyStore, load_default_policy_store


@dataclass(frozen=True)
class IncrementalSourceResult:
    source: str
    watermark: datetime | None
    crawl: CrawlResult
    classified: list[ClassifiedArticle]

    @property
    def accepted(self):
        return [item.article for item in self.classified if item.decision is EntityDecision.ACCEPT]

    @property
    def ambiguous(self):
        return [item for item in self.classified if item.decision is EntityDecision.AMBIGUOUS]

    @property
    def rejected(self):
        return [item for item in self.classified if item.decision is EntityDecision.REJECT]

    @property
    def safety_errors(self) -> list[str]:
        errors = []
        if not self.crawl.watermark_reached:
            errors.append(
                "max-pages 안에 기존 watermark에 도달하지 못함"
                if self.watermark else
                "DB가 비어 있으나 max-pages 안에 검색 결과 끝에 도달하지 못함"
            )
        if self.crawl.missing_dates:
            errors.append(f"게시 시각을 파싱하지 못한 기사 {self.crawl.missing_dates}건")
        if not self.crawl.chronology_valid:
            errors.append("검색 결과의 게시 시각이 최신순이 아님")
        if self.ambiguous:
            errors.append(f"사람의 확인이 필요한 동명이인 후보 {len(self.ambiguous)}건")
        return errors

    @property
    def safe_to_submit(self) -> bool:
        return not self.safety_errors

    def as_review_dict(self) -> dict:
        return {
            "source": self.source,
            "watermark": self.watermark.isoformat() if self.watermark else None,
            "pagesCrawled": self.crawl.pages_crawled,
            "availablePages": self.crawl.available_pages,
            "watermarkReached": self.crawl.watermark_reached,
            "missingDates": self.crawl.missing_dates,
            "chronologyValid": self.crawl.chronology_valid,
            "accepted": len(self.accepted),
            "ambiguous": len(self.ambiguous),
            "rejected": len(self.rejected),
            "safeToSubmit": self.safe_to_submit,
            "safetyErrors": self.safety_errors,
            "articles": [item.as_review_dict() for item in self.classified],
        }


def build_incremental_result(
    source: str,
    crawl: CrawlResult,
    watermark: datetime | None,
    keyword: str,
    policy_store: IdentityPolicyStore | None = None,
) -> IncrementalSourceResult:
    policies = policy_store or load_default_policy_store()
    normalized = normalize_and_dedupe(crawl.articles, keyword)
    candidates = [
        article for article in normalized
        if watermark is None or datetime.fromisoformat(article.published_at) >= watermark
    ]
    return IncrementalSourceResult(
        source=source,
        watermark=watermark,
        crawl=crawl,
        classified=[classify_entity(article, policies) for article in candidates],
    )
