import json
import unittest
from urllib.parse import urlencode

from crawlers.supersohee_crawlers.naver_public import (
    NewsPageBudget, NewsPageError, normalize_article_url, parse_news_page, validate_search_url,
)

QUERY = "월드컵 이소희"
BASE = "https://search.naver.com/search.naver?" + urlencode({"query": QUERY, "ssc": "tab.news.all"})
NEXT = "https://s.search.naver.com/p/newssearch/3/api/tab/more?" + urlencode({"query": QUERY, "ssc": "tab.news.all", "start": 11})
NEXT_V4 = NEXT.replace("/newssearch/3/", "/newssearch/4/")


def fixture(nodes, query=QUERY, ssc="tab.news.all"):
    return 'entry.bootstrap(document.getElementById("synthetic"), ' + json.dumps({
        "meta": {"query": query, "ssc": ssc}, "body": {"children": nodes}
    }) + ');'


def article(url="https://news.example.com/a", title="<mark>이소희</mark> 농구 월드컵"):
    return {"title": title, "titleHref": url, "content": "농구 &amp; 대표팀",
            "sourceProfile": {"title": "합성 언론", "titleHref": "https://media.naver.com/press/000",
                              "subTexts": [{"text": "2시간 전"}, {"text": "네이버뉴스", "textHref": "https://m.sports.naver.com/basketball/article/000/1"}]}}


class NaverPublicTests(unittest.TestCase):
    def test_main_related_and_no_profile_links_or_invented_dates(self):
        node = article()
        node["subInfoCluster"] = [article("http://rookie.co.kr/news/1?utm_source=n#top")]
        node["moreTitleHref"] = BASE + "&related=1"
        result = parse_news_page(fixture([node]), QUERY)
        self.assertEqual(len(result["candidates"]), 2)
        self.assertEqual(result["candidates"][0]["title"], "이소희 농구 월드컵")
        self.assertEqual(result["candidates"][0]["summary"], "농구 & 대표팀")
        self.assertEqual(result["candidates"][0]["dateText"], "2시간 전")
        self.assertNotIn("publishedAt", result["candidates"][0])
        self.assertEqual(result["candidates"][1]["source"], "rookie")
        self.assertEqual(result["candidates"][1]["url"], "https://www.rookie.co.kr/news/1")
        self.assertEqual(len(result["related_urls"]), 1)

    def test_next_from_html_and_xload_scope(self):
        document = fixture([article()]) + 'new XLoad({"url":' + json.dumps(NEXT).replace("/", "\\/") + '});'
        self.assertEqual(parse_news_page(document, QUERY)["next_url"], NEXT)
        response = {"collection": [{"html": "<div/>", "script": fixture([article()])}], "url": NEXT}
        self.assertEqual(len(parse_news_page(response, QUERY, BASE)["candidates"]), 1)
        with self.assertRaises(NewsPageError):
            parse_news_page(response, QUERY)

    def test_versioned_more_endpoint(self):
        document = fixture([article()]) + 'new XLoad({"url":' + json.dumps(NEXT_V4).replace("/", "\\/") + '});'
        self.assertEqual(parse_news_page(document, QUERY)["next_url"], NEXT_V4)
        response = {"collection": [{"html": "<div/>", "script": fixture([article()])}], "url": NEXT_V4.replace("start=11", "start=21")}
        result = parse_news_page(response, QUERY, NEXT_V4)
        self.assertEqual(len(result["candidates"]), 1)
        self.assertIn("start=21", result["next_url"])
        for path in ["/p/newssearch/0/api/tab/more", "/p/newssearch/100/api/tab/more", "/p/newssearch/x/api/tab/more",
                     "/p/newssearch/4/api/tab/other", "/p/newssearch/4/api/tab/more/extra", "/p/blogsearch/4/api/tab/more"]:
            with self.assertRaises(NewsPageError):
                validate_search_url(NEXT_V4.replace("/p/newssearch/4/api/tab/more", path), QUERY)

    def test_fail_closed_wrong_scope_query_changed_structure(self):
        for payload in [fixture([], ssc="tab.blog.all"), fixture([], query="다른 검색"), '<a class="tit">not news</a>']:
            with self.assertRaises(NewsPageError):
                parse_news_page(payload, QUERY)
        for url in [NEXT.replace("s.search.naver.com", "evil.example.com"), BASE.replace("tab.news.all", "tab.blog.all"), BASE + "&query=other", "http://search.naver.com/search.naver"]:
            with self.assertRaises(NewsPageError):
                validate_search_url(url, QUERY)

    def test_unsafe_links_dedupe_and_tracking(self):
        result = parse_news_page(fixture([article("http://www.jumpball.co.kr/a?utm_source=x&nclick=1"), article("https://jumpball.co.kr/a?nclick=1"), article("http://127.0.0.1/a"), article("javascript:alert(1)")]), QUERY)
        self.assertEqual(len(result["candidates"]), 1)
        self.assertEqual(result["duplicates"], 1)
        self.assertEqual(len(result["errors"]), 2)
        self.assertEqual(normalize_article_url("https://jumpball.co.kr.evil.example.com/a")[1], "other")

    def test_empty_valid_news_and_bounded_cursor(self):
        self.assertEqual(parse_news_page(fixture([]), QUERY)["candidates"], [])
        budget = NewsPageBudget(QUERY, 1)
        budget.claim(BASE)
        with self.assertRaisesRegex(NewsPageError, "repeated"):
            budget.claim(BASE)
        with self.assertRaisesRegex(NewsPageError, "exhausted"):
            budget.claim(NEXT)


if __name__ == "__main__":
    unittest.main()
