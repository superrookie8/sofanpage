from datetime import datetime
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo

import requests

from .models import NormalizedArticle


SUPPORTED_SOURCES = {"jumpball", "rookie"}
MAX_IMPORT_BATCH = 200
SEOUL = ZoneInfo("Asia/Seoul")


def normalize_source_watermark(source: str, value: datetime) -> datetime:
    if source not in SUPPORTED_SOURCES:
        raise ValueError("unsupported article source")
    local = (
        value.astimezone(SEOUL).replace(tzinfo=None)
        if value.tzinfo is not None
        else value
    )
    if source == "rookie":
        return local.replace(second=0, microsecond=0)
    return local.replace(microsecond=0)


class SpringArticleClient:
    def __init__(self, backend_url: str, timeout: float = 10):
        parsed = urlsplit(backend_url)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname:
            raise ValueError("SUPERSOHEE_BACKEND_URL must be an HTTP(S) origin")
        if parsed.scheme == "http" and parsed.hostname not in {"localhost", "127.0.0.1", "::1"}:
            raise ValueError("plain HTTP is allowed only for a local backend")
        if not 1 <= timeout <= 30:
            raise ValueError("timeout must be between 1 and 30 seconds")
        self.backend_url = backend_url.rstrip("/")
        self.timeout = timeout

    def latest_published_at(self, source: str) -> datetime | None:
        if source not in SUPPORTED_SOURCES:
            raise ValueError("unsupported article source")
        response = requests.get(
            f"{self.backend_url}/api/articles/{source}",
            params={"page": 0, "limit": 1},
            timeout=self.timeout,
            allow_redirects=False,
        )
        if response.is_redirect or response.is_permanent_redirect:
            raise RuntimeError("article watermark endpoint must not redirect")
        response.raise_for_status()
        body = response.json()
        articles = body.get("articles") if isinstance(body, dict) else None
        if not isinstance(articles, list):
            raise RuntimeError("article watermark response is invalid")
        if not articles:
            return None
        first = articles[0]
        if not isinstance(first, dict) or first.get("source") != source:
            raise RuntimeError("article watermark source is invalid")
        value = first.get("publishedAt")
        if not isinstance(value, str):
            raise RuntimeError("article watermark publishedAt is invalid")
        try:
            watermark = datetime.fromisoformat(
                value[:-1] + "+00:00" if value.endswith(("Z", "z")) else value
            )
        except ValueError as error:
            raise RuntimeError("article watermark publishedAt is invalid") from error
        return normalize_source_watermark(source, watermark)


class SpringImportClient(SpringArticleClient):
    def __init__(self, backend_url: str, import_key: str, timeout: float = 10):
        super().__init__(backend_url, timeout)
        if len(import_key.encode("utf-8")) < 32:
            raise ValueError("SUPERSOHEE_ARTICLE_IMPORT_KEY must be at least 32 bytes")
        self.url = self.backend_url + "/api/admin/articles/import"
        self.import_key = import_key

    def submit(self, articles: list[NormalizedArticle]) -> dict:
        response = requests.post(
            self.url,
            headers={"X-Article-Import-Key": self.import_key},
            json={"articles": [article.as_api_dict() for article in articles]},
            timeout=self.timeout,
            allow_redirects=False,
        )
        if response.is_redirect or response.is_permanent_redirect:
            raise RuntimeError("article import endpoint must not redirect")
        response.raise_for_status()
        return response.json()

    def submit_oldest_first(self, articles: list[NormalizedArticle]) -> dict:
        ordered = sorted(articles, key=lambda article: (article.published_at, article.url))
        aggregate = {"processed": 0, "created": 0, "existing": 0, "batches": 0}
        for start in range(0, len(ordered), MAX_IMPORT_BATCH):
            result = self.submit(ordered[start:start + MAX_IMPORT_BATCH])
            aggregate["processed"] += int(result.get("processed", 0))
            aggregate["created"] += int(result.get("created", 0))
            aggregate["existing"] += int(result.get("existing", 0))
            aggregate["batches"] += 1
        return aggregate
