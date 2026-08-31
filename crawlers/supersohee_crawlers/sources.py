from dataclasses import replace
from datetime import datetime
from typing import Protocol

from .http import BoundedHttpClient
from .models import CrawlResult, RawArticle
from .parsers import (
    enrich_summary_with_detail,
    parse_jumpball_body,
    parse_jumpball_listing,
    parse_jumpball_published_at,
    parse_pagination_state,
    parse_rookie_body,
    parse_rookie_listing,
    parse_rookie_search_context,
)


class SourceAdapter(Protocol):
    def crawl(self, keyword: str, max_pages: int, watermark: datetime | None) -> CrawlResult: ...


def _is_descending(articles: list[RawArticle]) -> bool:
    dates = [article.published_at for article in articles if article.published_at]
    return all(previous >= current for previous, current in zip(dates, dates[1:]))


def _result(
    articles: list[RawArticle],
    pages_crawled: int,
    available_pages: int,
    older_than_watermark_seen: bool,
    watermark_seen: bool,
    has_watermark: bool,
    pagination_terminal: bool,
) -> CrawlResult:
    return CrawlResult(
        articles=articles,
        pages_crawled=pages_crawled,
        available_pages=available_pages,
        watermark_reached=(
            older_than_watermark_seen or (watermark_seen and pagination_terminal)
            if has_watermark else pagination_terminal
        ),
        missing_dates=sum(article.published_at is None for article in articles),
        chronology_valid=_is_descending(articles),
    )


class JumpballAdapter:
    SEARCH_URL = "https://jumpball.co.kr/news/search.php"

    def __init__(self, client: BoundedHttpClient):
        self.client = client

    def crawl(self, keyword: str, max_pages: int, watermark: datetime | None = None) -> CrawlResult:
        if not 1 <= max_pages <= 10:
            raise ValueError("max_pages must be between 1 and 10")
        output: list[RawArticle] = []
        search_params = {"q": keyword, "sfld": "all", "period": "MONTH|12"}
        first = self.client.get(self.SEARCH_URL, search_params)
        available_pages = 1
        pages_crawled = 0
        older_than_watermark_seen = False
        watermark_seen = False
        pagination_terminal = False
        page = 1
        visited_pages: set[int] = set()
        while pages_crawled < max_pages and page not in visited_pages:
            visited_pages.add(page)
            html = first if page == 1 else self.client.get(
                self.SEARCH_URL, {**search_params, "pagenum": page - 1}
            )
            listing_articles = parse_jumpball_listing(html, keyword)
            pagination = parse_pagination_state(
                html,
                "pagenum",
                page,
                "#listWrap .listPhoto",
                "#listWrap",
                pagination_selector=".pageindex",
                parameter_page_offset=1,
            )
            if (
                not pagination.valid
                or (listing_articles and not pagination.current_page_confirmed)
            ):
                raise RuntimeError("Jumpball search pagination could not be verified")
            available_pages = max(
                available_pages,
                pagination.last_page or pagination.max_visible_page,
            )
            page_articles = []
            for article in listing_articles:
                detail = self.client.get(article.url)
                body = parse_jumpball_body(detail)
                if not body:
                    raise RuntimeError("Jumpball article body could not be parsed")
                page_articles.append(
                    replace(
                        article,
                        published_at=parse_jumpball_published_at(detail),
                        summary=enrich_summary_with_detail(
                            article.summary,
                            body,
                            keyword,
                        ),
                    )
                )
            output.extend(page_articles)
            pages_crawled += 1
            if watermark:
                watermark_seen = watermark_seen or any(
                    article.published_at == watermark for article in page_articles
                )
                older_than_watermark_seen = older_than_watermark_seen or any(
                    article.published_at and article.published_at < watermark
                    for article in page_articles
                )
                if older_than_watermark_seen:
                    break
            if pagination.terminal:
                pagination_terminal = True
                break
            if pagination.next_page is None:
                break
            page = pagination.next_page
        return _result(
            output, pages_crawled, available_pages,
            older_than_watermark_seen, watermark_seen, watermark is not None,
            pagination_terminal,
        )


class RookieAdapter:
    SEARCH_URL = "https://www.rookie.co.kr/news/articleList.html"

    def __init__(self, client: BoundedHttpClient):
        self.client = client

    def crawl(self, keyword: str, max_pages: int, watermark: datetime | None = None) -> CrawlResult:
        if not 1 <= max_pages <= 10:
            raise ValueError("max_pages must be between 1 and 10")
        first = self.client.post_form(self.SEARCH_URL, {
            "sc_area": "A",
            "sc_word": keyword,
            "view_type": "sm",
        })
        search_context = parse_rookie_search_context(first, keyword)
        if search_context is None:
            raise RuntimeError("Rookie search response identity could not be verified")
        available_pages = 1
        output: list[RawArticle] = []
        pages_crawled = 0
        older_than_watermark_seen = False
        watermark_seen = False
        pagination_terminal = False
        page = 1
        visited_pages: set[int] = set()
        while pages_crawled < max_pages and page not in visited_pages:
            visited_pages.add(page)
            if page == 1:
                html = first
            else:
                html = self.client.post_form(self.SEARCH_URL, {
                    "page": page,
                    "total": search_context.total,
                    "box_idxno": "",
                    "sc_area": "A",
                    "sc_word": keyword,
                    "view_type": "sm",
                })
            pagination = parse_pagination_state(
                html,
                "page",
                page,
                "#section-list > ul > li",
                "#section-list > ul",
            )
            current_context = parse_rookie_search_context(
                html,
                keyword if page == 1 else None,
            )
            listing_articles = parse_rookie_listing(html, keyword)
            if (
                not pagination.valid
                or (listing_articles and not pagination.current_page_confirmed)
                or current_context != search_context
                or pagination.last_page != search_context.last_page
            ):
                raise RuntimeError("Rookie search pagination identity changed")
            page_articles = []
            for article in listing_articles:
                detail = self.client.get(article.url)
                body = parse_rookie_body(detail)
                if not body:
                    raise RuntimeError("Rookie article body could not be parsed")
                page_articles.append(replace(
                    article,
                    summary=enrich_summary_with_detail(
                        article.summary,
                        body,
                        keyword,
                    ),
                ))
            available_pages = max(
                available_pages,
                pagination.last_page or pagination.max_visible_page,
            )
            output.extend(page_articles)
            pages_crawled += 1
            if watermark:
                watermark_seen = watermark_seen or any(
                    article.published_at == watermark for article in page_articles
                )
                older_than_watermark_seen = older_than_watermark_seen or any(
                    article.published_at and article.published_at < watermark
                    for article in page_articles
                )
                if older_than_watermark_seen:
                    break
            if pagination.terminal:
                pagination_terminal = True
                break
            if pagination.next_page is None:
                break
            page = pagination.next_page
        return _result(
            output, pages_crawled, available_pages,
            older_than_watermark_seen, watermark_seen, watermark is not None,
            pagination_terminal,
        )
