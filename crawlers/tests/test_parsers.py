from datetime import datetime
from pathlib import Path
import unittest

from crawlers.supersohee_crawlers.parsers import (
    DETAIL_SUMMARY_MAX_CHARS,
    RookieSearchContext,
    enrich_summary_with_detail,
    parse_jumpball_body,
    parse_jumpball_listing,
    parse_jumpball_published_at,
    parse_pagination_state,
    parse_rookie_body,
    parse_rookie_listing,
    parse_rookie_search_context,
)


FIXTURES = Path(__file__).parent / "fixtures"


class ParserTests(unittest.TestCase):
    def fixture(self, name: str) -> str:
        return (FIXTURES / name).read_text(encoding="utf-8")

    def test_jumpball_fixture(self):
        html = self.fixture("jumpball-list.html")
        articles = parse_jumpball_listing(html, "이소희")
        self.assertEqual(len(articles), 2)
        self.assertEqual(articles[0].url, "https://jumpball.co.kr/news/newsview.php?ncode=1")
        pagination = parse_pagination_state(
            html,
            "pagenum",
            1,
            "#listWrap .listPhoto",
            "#listWrap",
            pagination_selector=".pageindex",
            parameter_page_offset=1,
        )
        self.assertIsNone(pagination.last_page)
        self.assertEqual(pagination.max_visible_page, 3)
        self.assertEqual(pagination.next_page, 2)
        self.assertEqual(
            parse_jumpball_published_at(self.fixture("jumpball-detail.html")),
            datetime(2026, 8, 28, 14, 30),
        )
        self.assertIn("이소희", parse_jumpball_body(self.fixture("jumpball-detail.html")))

    def test_rookie_fixture(self):
        html = self.fixture("rookie-list.html")
        articles = parse_rookie_listing(html, "이소희")
        self.assertEqual(len(articles), 3)
        self.assertEqual(articles[0].source, "rookie")
        self.assertEqual(articles[0].published_at, datetime(2026, 8, 27, 9, 15))
        self.assertIn("이소희", articles[1].summary)
        self.assertEqual(
            parse_rookie_search_context(html, "이소희"),
            RookieSearchContext(total=1232, last_page=62),
        )
        pagination = parse_pagination_state(
            html, "page", 1, "#section-list > ul > li", "#section-list > ul"
        )
        self.assertEqual(pagination.last_page, 62)
        self.assertEqual(pagination.next_page, 2)
        self.assertTrue(pagination.current_page_confirmed)
        self.assertFalse(pagination.terminal)

        last_page_html = html.replace(
            '<li class="current user-bg">1</li>',
            '<li class="current user-bg">62</li>',
        )
        last_page = parse_pagination_state(
            last_page_html, "page", 62, "#section-list > ul > li", "#section-list > ul"
        )
        self.assertTrue(last_page.terminal)

    def test_rookie_all_articles_page_is_not_a_search_result(self):
        html = """
        <div class="view-type"><a href="?page=1&total=103022&sc_word=">요약형</a></div>
        <section id="section-list"><ul><li>
          <h4 class="titles"><a href="/news/1">일반 기사</a></h4>
        </li></ul></section>
        <ul class="pagination"><li class="pagination-end">
          <a href="?page=5152&total=103022" title="끝">끝</a>
        </li></ul>
        """
        self.assertIsNone(parse_rookie_search_context(html, "이소희"))
        self.assertEqual(
            parse_rookie_search_context(html),
            RookieSearchContext(total=103022, last_page=5152),
        )

    def test_detail_body_enriches_a_listing_without_visible_keyword(self):
        body = parse_rookie_body(self.fixture("rookie-detail.html"))
        self.assertIn("이소희", body)
        summary = enrich_summary_with_detail(
            "검색어가 보이지 않는 정상 검색 결과 요약",
            body,
            "이소희",
        )
        self.assertIn("이소희", summary)
        self.assertLessEqual(len(summary), DETAIL_SUMMARY_MAX_CHARS)

    def test_pagination_requires_recognized_empty_results_or_explicit_terminal(self):
        missing_dom = parse_pagination_state(
            "<html><body>layout changed</body></html>",
            "page",
            2,
            "#section-list > ul > li",
            "#section-list > ul",
        )
        self.assertFalse(missing_dom.valid)
        self.assertFalse(missing_dom.terminal)

        recognized_empty = parse_pagination_state(
            '<section id="section-list"><ul></ul></section>',
            "page",
            2,
            "#section-list > ul > li",
            "#section-list > ul",
        )
        self.assertTrue(recognized_empty.valid)
        self.assertTrue(recognized_empty.terminal)

        changed_item_tag = parse_pagination_state(
            '<section id="section-list"><ul><article>new markup</article></ul></section>',
            "page",
            2,
            "#section-list > ul > li",
            "#section-list > ul",
        )
        self.assertFalse(changed_item_tag.valid)
        self.assertFalse(changed_item_tag.terminal)

    def test_windowed_pagination_is_not_terminal_without_explicit_last_or_disabled_next(self):
        html = """
        <section id="section-list"><ul><li>article</li></ul></section>
        <div class="pagination">
          <a href="?page=1">1</a><strong aria-current="page">2</strong>
          <a href="?page=3">3</a><a class="next" href="?page=3">다음</a>
        </div>
        """
        state = parse_pagination_state(
            html, "page", 2, "#section-list > ul > li", "#section-list > ul"
        )
        self.assertTrue(state.valid)
        self.assertFalse(state.terminal)
        self.assertEqual(state.next_page, 3)
        self.assertTrue(state.current_page_confirmed)

        missing_current = parse_pagination_state(
            html.replace('<strong aria-current="page">2</strong>', '<strong>2</strong>'),
            "page", 2, "#section-list > ul > li", "#section-list > ul"
        )
        self.assertTrue(missing_current.valid)
        self.assertFalse(missing_current.current_page_confirmed)

        mismatched_current = parse_pagination_state(
            html, "page", 3, "#section-list > ul > li", "#section-list > ul"
        )
        self.assertFalse(mismatched_current.valid)
        self.assertFalse(mismatched_current.terminal)

    def test_rookie_keyword_item_without_date_is_retained_for_submit_safety(self):
        html = """
        <section id="section-list"><ul><li>
          <div class="titles"><a href="/news/undated">BNK 썸 이소희 인터뷰</a></div>
          <div class="lead"><a>BNK 썸 이소희 인터뷰</a></div>
          <div class="byline"><em>날짜 형식 변경</em></div>
        </li></ul></section>
        """
        articles = parse_rookie_listing(html, "이소희")
        self.assertEqual(len(articles), 1)
        self.assertIsNone(articles[0].published_at)


if __name__ == "__main__":
    unittest.main()
