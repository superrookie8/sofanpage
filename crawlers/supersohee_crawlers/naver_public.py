"""Pure parser for already downloaded public Naver NEWS-tab responses.

No network, credentials, DB, JavaScript execution or inferred publication timestamps.
Caller owns bounded HTTP/pacing, DNS/private-address protection and editorial review.
"""
import html
import ipaddress
import json
import re
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit

from bs4 import BeautifulSoup

_BOOTSTRAP = re.compile(r"entry\.bootstrap\(document\.getElementById\([^)]*\),\s*")
# Naver versions the "more" endpoint (/3/ until 2026-09, /4/ from 2026-10); the schema is unchanged.
_MORE_PATH = re.compile(r"/p/newssearch/[1-9][0-9]?/api/tab/more")
_NEXT = re.compile(r'"url"\s*:\s*("https:(?:\\/|/){2}s\.search\.naver\.com[^"\n]*")')
MAX_BYTES = 12_000_000


class NewsPageError(ValueError):
    """Fail closed when search scope, response schema or a cursor is unsafe."""


def public_url(value: str) -> str:
    if not isinstance(value, str) or not value or len(value) > 4000:
        raise NewsPageError("invalid_public_url")
    if re.search(r"[\x00-\x20\\]", value):
        raise NewsPageError("invalid_public_url")
    try:
        parts = urlsplit(value)
        host = (parts.hostname or "").lower()
        if (parts.scheme not in {"http", "https"} or parts.username or parts.password
                or parts.port not in {None, 80, 443} or "." not in host
                or host.endswith((".localhost", ".local", ".internal", ".test", ".invalid"))
                or ".." in host or not re.fullmatch(r"[a-z0-9.-]+", host)):
            raise NewsPageError("invalid_public_url")
        try:
            ipaddress.ip_address(host)
        except ValueError:
            pass
        else:
            raise NewsPageError("ip_literal_not_allowed")
        return urlunsplit((parts.scheme, parts.netloc.lower(), parts.path or "/", parts.query, ""))
    except ValueError as error:
        raise NewsPageError("invalid_public_url") from error


def normalize_article_url(value: str) -> tuple[str, str]:
    parts = urlsplit(public_url(value))
    host = parts.hostname
    source = "jumpball" if host in {"jumpball.co.kr", "www.jumpball.co.kr"} else (
        "rookie" if host in {"rookie.co.kr", "www.rookie.co.kr"} else "other")
    authority = "jumpball.co.kr" if source == "jumpball" else "www.rookie.co.kr" if source == "rookie" else parts.netloc
    # Preserve nontracking raw query encoding/order, matching backend identity policy.
    query = "&".join(part for part in parts.query.split("&") if part and not (
        part.split("=", 1)[0].lower().startswith("utm_")
        or part.split("=", 1)[0].lower() in {"fbclid", "gclid"}))
    return urlunsplit(("https" if source != "other" else parts.scheme, authority, parts.path, query, "")), source


def validate_search_url(value: str, expected_query: str, base_url: str = "https://search.naver.com/search.naver") -> str:
    normalized = public_url(urljoin(base_url, value))
    parts = urlsplit(normalized)
    if parts.scheme != "https" or parts.port is not None:
        raise NewsPageError("unsafe_news_cursor")
    allowed = (parts.hostname == "search.naver.com" and parts.path == "/search.naver") or (
        parts.hostname == "s.search.naver.com" and _MORE_PATH.fullmatch(parts.path) is not None)
    params = dict(parse_qsl(parts.query, keep_blank_values=True))
    if (not allowed or params.get("query") != expected_query
            or params.get("ssc") != "tab.news.all" or params.get("where", "news") != "news"):
        raise NewsPageError("news_scope_or_query_mismatch")
    # Duplicate query/scope values can be interpreted differently by an upstream.
    for key in ("query", "ssc", "where"):
        if len([k for k, _ in parse_qsl(parts.query, keep_blank_values=True) if k == key]) > 1:
            raise NewsPageError("ambiguous_news_cursor")
    return normalized


def _text(value) -> str:
    return " ".join(BeautifulSoup(html.unescape(value if isinstance(value, str) else ""), "html.parser").get_text(" ").split())


def _walk(value, depth=0):
    if depth > 80:
        raise NewsPageError("response_too_deep")
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from _walk(child, depth + 1)
    elif isinstance(value, list):
        for child in value:
            yield from _walk(child, depth + 1)


def parse_news_page(payload: str | dict, expected_query: str, page_url: str | None = None) -> dict:
    """Return candidates, validated next/related URLs, errors and coverage metadata.

    Candidates are discovery evidence only, NOT import-ready articles: dateText may
    be relative and must never be converted into an invented publishedAt.
    """
    if not isinstance(expected_query, str) or not expected_query.strip() or len(expected_query) > 100:
        raise NewsPageError("invalid_query")
    if page_url:
        validate_search_url(page_url, expected_query)
    chunks = []
    raw_next = None
    if isinstance(payload, dict):
        if not page_url:
            raise NewsPageError("xload_requires_validated_page_url")
        collection = payload.get("collection")
        if not isinstance(collection, list) or not all(isinstance(row, dict) for row in collection):
            raise NewsPageError("invalid_xload_schema")
        for row in collection:
            chunks.extend(v for k in ("html", "script") if isinstance((v := row.get(k)), str))
        raw_next = payload.get("url")
    elif isinstance(payload, str):
        chunks = [payload]
    else:
        raise NewsPageError("invalid_payload")
    if sum(len(chunk.encode()) for chunk in chunks) > MAX_BYTES:
        raise NewsPageError("response_too_large")
    candidates, errors, related, seen = [], [], [], set()
    duplicates = 0
    matched = 0
    for chunk in chunks:
        for match in _BOOTSTRAP.finditer(chunk):
            try:
                data, _ = json.JSONDecoder().raw_decode(chunk[match.end():])
            except (ValueError, RecursionError) as error:
                raise NewsPageError("invalid_bootstrap_json") from error
            meta = data.get("meta", {}) if isinstance(data, dict) else {}
            if meta.get("ssc") != "tab.news.all" or meta.get("query") != expected_query:
                continue
            matched += 1
            for node in _walk(data.get("body")):
                if not all(k in node for k in ("title", "titleHref", "sourceProfile")):
                    continue
                try:
                    url, source = normalize_article_url(node["titleHref"])
                    title = _text(node["title"])
                    if not title or len(title) > 300 or len(url) > 2000:
                        raise NewsPageError("invalid_article_metadata")
                    if url in seen:
                        duplicates += 1
                        continue
                    profile = node["sourceProfile"]
                    if not isinstance(profile, dict):
                        raise NewsPageError("invalid_source_profile")
                    subtexts = profile.get("subTexts", [])
                    date_text = ""
                    naver_url = None
                    for subtext in subtexts if isinstance(subtexts, list) else []:
                        if not isinstance(subtext, dict):
                            continue
                        if subtext.get("textHref"):
                            candidate_url = public_url(subtext["textHref"])
                            if urlsplit(candidate_url).hostname in {"news.naver.com", "n.news.naver.com", "sports.naver.com", "m.sports.naver.com"}:
                                naver_url = candidate_url
                        elif subtext.get("text"):
                            date_text = _text(subtext["text"])
                    image_url = None
                    if node.get("imageSrc"):
                        try:
                            image_url = public_url(node["imageSrc"])
                        except NewsPageError:
                            errors.append({"code": "invalid_image_url"})
                    seen.add(url)
                    candidates.append({"title": title, "url": url, "source": source,
                                       "summary": _text(node.get("content"))[:20000],
                                       "naverUrl": naver_url, "imageUrl": image_url,
                                       "dateText": date_text, "publisher": _text(profile.get("title"))})
                    if node.get("moreTitleHref"):
                        try:
                            related.append(validate_search_url(node["moreTitleHref"], expected_query))
                        except NewsPageError:
                            errors.append({"code": "invalid_related_cursor"})
                except (NewsPageError, TypeError):
                    errors.append({"code": "invalid_article_metadata"})
        if raw_next is None:
            match = _NEXT.search(chunk)
            if match:
                raw_next = json.loads(match.group(1))
    if not matched:
        raise NewsPageError("expected_news_bootstrap_missing")
    next_url = validate_search_url(raw_next, expected_query) if raw_next else None
    return {"candidates": candidates, "next_url": next_url, "related_urls": list(dict.fromkeys(related)),
            "errors": errors, "duplicates": duplicates, "query": expected_query,
            "coverage": "public_news_tab_visible_cards_and_related_cards_only", "bootstrap_count": matched}


class NewsPageBudget:
    """Caller must claim EVERY main/related/next page before its network request."""
    def __init__(self, query: str, max_pages: int = 50):
        if not isinstance(max_pages, int) or not 1 <= max_pages <= 100:
            raise NewsPageError("invalid_page_budget")
        self.query, self.max_pages, self.seen = query, max_pages, set()

    def claim(self, url: str) -> str:
        safe = validate_search_url(url, self.query)
        parts = urlsplit(safe)
        identity = urlunsplit((parts.scheme, parts.netloc, parts.path,
                               urlencode(sorted(parse_qsl(parts.query, keep_blank_values=True))), ""))
        if identity in self.seen:
            raise NewsPageError("repeated_page_cursor")
        if len(self.seen) >= self.max_pages:
            raise NewsPageError("page_budget_exhausted")
        self.seen.add(identity)
        return safe
