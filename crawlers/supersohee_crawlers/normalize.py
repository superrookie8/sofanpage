from urllib.parse import urlsplit, urlunsplit

from .models import NormalizedArticle, RawArticle


SOURCE_HOSTS = {
    "jumpball": {"jumpball.co.kr", "www.jumpball.co.kr"},
    "rookie": {"rookie.co.kr", "www.rookie.co.kr"},
}


def canonical_url(value: str) -> str:
    parsed = urlsplit(value)
    return urlunsplit((parsed.scheme.lower(), parsed.netloc.lower(), parsed.path, parsed.query, ""))


def normalize(article: RawArticle, keyword: str) -> NormalizedArticle | None:
    source = article.source.lower().strip()
    title = " ".join(article.title.split())
    summary = " ".join(article.summary.split())
    url = canonical_url(article.url.strip())
    parsed = urlsplit(url)
    if keyword not in f"{title} {summary}" or parsed.scheme != "https" or parsed.hostname not in SOURCE_HOSTS.get(source, set()):
        return None
    if not article.published_at:
        return None
    return NormalizedArticle(
        source=source,
        title=title,
        url=url,
        summary=summary,
        image_url=canonical_url(article.image_url) if article.image_url else None,
        published_at=article.published_at.replace(microsecond=0).isoformat(),
    )


def normalize_and_dedupe(articles: list[RawArticle], keyword: str) -> list[NormalizedArticle]:
    unique: dict[str, NormalizedArticle] = {}
    for article in articles:
        normalized = normalize(article, keyword)
        if normalized:
            unique.setdefault(normalized.url, normalized)
    return sorted(unique.values(), key=lambda item: item.published_at, reverse=True)
