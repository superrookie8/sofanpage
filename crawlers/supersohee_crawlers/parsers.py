import re
from dataclasses import dataclass
from datetime import datetime
from urllib.parse import parse_qs, urljoin, urlsplit

from bs4 import BeautifulSoup

from .models import RawArticle


@dataclass(frozen=True)
class PaginationState:
    terminal: bool
    next_page: int | None
    last_page: int | None
    max_visible_page: int
    valid: bool
    current_page_confirmed: bool = False


@dataclass(frozen=True)
class RookieSearchContext:
    total: int
    last_page: int


DETAIL_SUMMARY_MAX_CHARS = 4_000
DETAIL_KEYWORD_CONTEXT_CHARS = 600


def _text(node) -> str:
    return " ".join(node.get_text(" ", strip=True).split()) if node else ""


def _style_url(style: str) -> str | None:
    match = re.search(r"url\(['\"]?([^'\")]+)", style or "")
    return match.group(1) if match else None


def _detail_body(html: str, selector: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    body = soup.select_one(selector)
    if body is None:
        return ""
    for node in body.select("script, style, noscript"):
        node.decompose()
    return _text(body)


def _bounded_detail_summary(listing_summary: str, body: str, keyword: str) -> str:
    listing = " ".join(listing_summary.split())
    normalized_body = " ".join(body.split())
    starts = [match.start() for match in re.finditer(re.escape(keyword), normalized_body)]
    contexts: list[str] = []
    for start in starts:
        left = max(0, start - DETAIL_KEYWORD_CONTEXT_CHARS)
        right = min(len(normalized_body), start + len(keyword) + DETAIL_KEYWORD_CONTEXT_CHARS)
        context = normalized_body[left:right].strip()
        if context and context not in contexts:
            contexts.append(context)
    combined = " … ".join(part for part in [listing, *contexts] if part)
    return combined[:DETAIL_SUMMARY_MAX_CHARS]


def parse_jumpball_listing(html: str, keyword: str) -> list[RawArticle]:
    soup = BeautifulSoup(html, "html.parser")
    articles: list[RawArticle] = []
    for item in soup.select(".listPhoto"):
        anchor = item.select_one("dt a")
        title = _text(anchor)
        summary = _text(item.select_one(".conts")) or _text(item.select_one(".txt"))
        if not anchor:
            continue
        image_anchor = item.select_one(".img a")
        articles.append(RawArticle(
            source="jumpball",
            title=title,
            url=urljoin("https://jumpball.co.kr", anchor.get("href", "")),
            summary=summary,
            image_url=_style_url(image_anchor.get("style", "")) if image_anchor else None,
        ))
    return articles


def parse_jumpball_published_at(html: str) -> datetime | None:
    soup = BeautifulSoup(html, "html.parser")
    text = _text(soup.select_one(".viewTitle dl dd")) or _text(soup.select_one("#main .viewTitle dd"))
    match = re.search(r"(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})", text)
    return datetime.strptime(match.group(1), "%Y-%m-%d %H:%M:%S") if match else None


def parse_jumpball_body(html: str) -> str:
    return _detail_body(html, "#viewConts")


def parse_rookie_listing(html: str, keyword: str) -> list[RawArticle]:
    soup = BeautifulSoup(html, "html.parser")
    articles: list[RawArticle] = []
    for item in soup.select("#section-list > ul > li"):
        anchor = item.select_one(".titles a")
        title = _text(anchor)
        summary = _text(item.select_one(".lead a"))
        if not anchor:
            continue
        date_text = _text(item.select_one(".byline em:last-child"))
        match = re.search(r"(\d{4}\.\d{2}\.\d{2}\s+\d{2}:\d{2})", date_text)
        image = item.select_one(".thumb img")
        articles.append(RawArticle(
            source="rookie",
            title=title,
            url=urljoin("https://www.rookie.co.kr", anchor.get("href", "")),
            summary=summary,
            image_url=urljoin("https://www.rookie.co.kr", image.get("src", "")) if image else None,
            published_at=datetime.strptime(match.group(1), "%Y.%m.%d %H:%M") if match else None,
        ))
    return articles


def parse_rookie_body(html: str) -> str:
    return _detail_body(html, "#article-view-content-div.article-veiw-body")


def enrich_summary_with_detail(
    listing_summary: str,
    body: str,
    keyword: str,
) -> str:
    return _bounded_detail_summary(listing_summary, body, keyword)


def parse_rookie_search_context(
    html: str,
    keyword: str | None = None,
) -> RookieSearchContext | None:
    """Read the dynamic search result identity without hardcoding its total."""
    soup = BeautifulSoup(html, "html.parser")
    pagination = soup.select_one(".pagination")
    if soup.select_one("#section-list") is None or pagination is None:
        return None
    if keyword is not None:
        keyword_preserved = any(
            keyword in parse_qs(
                urlsplit(anchor.get("href", "")).query,
                keep_blank_values=True,
            ).get("sc_word", [])
            for anchor in soup.select(".view-type a[href*='sc_word=']")
        )
        if not keyword_preserved:
            return None

    totals: set[int] = set()
    last_pages: set[int] = set()
    for anchor in pagination.select("a[href]"):
        query = parse_qs(urlsplit(anchor.get("href", "")).query, keep_blank_values=True)
        total_values = query.get("total", [])
        if len(total_values) != 1 or not total_values[0].isdigit():
            return None
        totals.add(int(total_values[0]))
        descriptor = " ".join([
            " ".join(anchor.parent.get("class", [])) if anchor.parent else "",
            anchor.get("title", ""),
            anchor.get_text(" ", strip=True),
        ])
        if re.search(r"(?:^|[\s_-])end(?:[\s_-]|$)|(?:^|\s)끝(?:\s|$)", descriptor):
            page_values = query.get("page", [])
            if len(page_values) == 1 and page_values[0].isdigit():
                last_pages.add(int(page_values[0]))
    if len(totals) != 1 or len(last_pages) != 1:
        return None
    total = totals.pop()
    last_page = last_pages.pop()
    if total < 1 or last_page < 1:
        return None
    return RookieSearchContext(total=total, last_page=last_page)


def parse_pagination_state(
    html: str,
    parameter: str,
    current_page: int,
    item_selector: str,
    container_selector: str,
    pagination_selector: str = ".pagination",
    parameter_page_offset: int = 0,
) -> PaginationState:
    soup = BeautifulSoup(html, "html.parser")
    if not soup.select(item_selector):
        container = soup.select_one(container_selector)
        container_is_empty = (
            container is not None
            and container.find() is None
            and not container.get_text(" ", strip=True)
        )
        no_results = any(
            re.search(r"검색\s*결과가?\s*없|등록된\s*.*없|no\s+results?", node.get_text(" ", strip=True), re.IGNORECASE)
            for node in soup.select(
                ".no-result, .no-results, .nodata, .no-data, .empty, [data-empty='true']"
            )
        )
        if container_is_empty or no_results:
            return PaginationState(True, None, current_page, current_page, True)
        return PaginationState(False, None, None, current_page, False)

    pagination = soup.select_one(pagination_selector)
    if pagination is None:
        return PaginationState(False, None, None, current_page, False)

    values: list[int] = []
    last_pages: list[int] = []
    next_pages: list[int] = []
    valid = True
    for anchor in pagination.select("a"):
        match = re.search(rf"(?:[?&]){re.escape(parameter)}=(\d+)", anchor.get("href", ""))
        if match:
            page = int(match.group(1)) + parameter_page_offset
            if page < 1:
                valid = False
                continue
            values.append(page)
            descriptor = " ".join([
                " ".join(anchor.parent.get("class", [])) if anchor.parent else "",
                " ".join(anchor.get("class", [])),
                anchor.get_text(" ", strip=True),
                anchor.get("aria-label", ""),
                anchor.get("title", ""),
            ])
            if re.search(
                r"(?:^|[\s_-])(?:last|end)(?:[\s_-]|$)|마지막|맨끝|(?:^|\s)끝(?:\s|$)",
                descriptor,
                re.IGNORECASE,
            ):
                last_pages.append(page)
            if re.search(r"(?:^|\s)next(?:\s|$)|다음", descriptor, re.IGNORECASE):
                next_pages.append(page)

    current_markers = pagination.select("[aria-current='page'], .current, .active, .sel")
    marker_values = []
    for marker in current_markers:
        text = marker.get_text(" ", strip=True)
        if text.isdigit():
            marker_values.append(int(text))
    if marker_values and current_page not in marker_values:
        valid = False
    current_page_confirmed = current_page in marker_values

    pagination_controls = list(pagination.select("a, button"))
    pagination_controls.extend(
        node for node in pagination.select("span") if node.find_parent("a") is None
    )
    explicit_next_disabled = any(
        (
            "next" in " ".join(node.get("class", [])).lower()
            or "다음" in node.get_text(" ", strip=True)
        )
        and (
            node.get("aria-disabled", "").lower() == "true"
            or "disabled" in node.get("class", [])
            or not node.get("href")
        )
        for node in pagination_controls
    )
    last_page = max(last_pages) if last_pages else None
    if last_page is not None and last_page < current_page:
        valid = False
    terminal = valid and (
        explicit_next_disabled
        or (last_page is not None and current_page >= last_page)
    )
    greater_pages = sorted({page for page in values if page > current_page})
    explicit_next = sorted({page for page in next_pages if page > current_page})
    next_page = None if terminal or not valid else (
        explicit_next[0]
        if explicit_next
        else (current_page + 1 if greater_pages else None)
    )
    return PaginationState(
        terminal=terminal,
        next_page=next_page,
        last_page=last_page,
        max_visible_page=max(values, default=current_page),
        valid=valid,
        current_page_confirmed=current_page_confirmed,
    )
