from datetime import datetime
import unittest
from unittest.mock import Mock, patch

from crawlers.supersohee_crawlers.http import BoundedHttpClient
from crawlers.supersohee_crawlers.import_client import SpringImportClient
from crawlers.supersohee_crawlers.models import RawArticle
from crawlers.supersohee_crawlers.normalize import normalize_and_dedupe


class PipelineTests(unittest.TestCase):
    def test_normalize_filters_host_keyword_and_deduplicates(self):
        valid = RawArticle(
            source="jumpball",
            title="  이소희   20득점 ",
            url="https://jumpball.co.kr/news/1#comments",
            summary="  좋은   경기 ",
            published_at=datetime(2026, 8, 28, 10, 0),
        )
        duplicate = RawArticle(**{**valid.__dict__, "title": "이소희 20득점"})
        wrong_host = RawArticle(**{**valid.__dict__, "url": "https://attacker.example/news/1"})
        output = normalize_and_dedupe([valid, duplicate, wrong_host], "이소희")
        self.assertEqual(len(output), 1)
        self.assertEqual(output[0].title, "이소희 20득점")
        self.assertEqual(output[0].url, "https://jumpball.co.kr/news/1")

        summary_match = RawArticle(
            source="jumpball",
            title="대표팀 외곽 활약",
            url="https://jumpball.co.kr/news/2",
            summary="BNK 썸 이소희가 20점을 기록했다.",
            published_at=datetime(2026, 8, 28, 9, 0),
        )
        self.assertEqual(len(normalize_and_dedupe([summary_match], "이소희")), 1)

    def test_http_policy_is_bounded(self):
        with self.assertRaises(ValueError):
            BoundedHttpClient({"jumpball.co.kr"}, timeout=60)
        with self.assertRaises(ValueError):
            BoundedHttpClient({"jumpball.co.kr"}, retries=4)
        client = BoundedHttpClient({"jumpball.co.kr"}, pace_seconds=0)
        with self.assertRaises(ValueError):
            client.get("https://attacker.example/news")

    def test_read_only_form_post_uses_the_bounded_session(self):
        client = BoundedHttpClient({"www.rookie.co.kr"}, retries=0, pace_seconds=0)
        response = Mock(
            status_code=200,
            text="search result",
            is_redirect=False,
            is_permanent_redirect=False,
        )
        response.raise_for_status = Mock()
        client.session.post = Mock(return_value=response)

        result = client.post_form(
            "https://www.rookie.co.kr/news/articleList.html",
            {"sc_area": "A", "sc_word": "이소희", "view_type": "sm"},
        )

        self.assertEqual(result, "search result")
        self.assertEqual(client.session.post.call_args.kwargs["allow_redirects"], False)

    @patch("crawlers.supersohee_crawlers.import_client.requests.post")
    def test_import_client_keeps_key_server_side(self, post: Mock):
        response = Mock()
        response.json.return_value = {"processed": 1, "created": 1, "existing": 0}
        response.is_redirect = False
        response.is_permanent_redirect = False
        post.return_value = response
        article = normalize_and_dedupe([RawArticle(
            source="rookie", title="이소희 인터뷰", url="https://www.rookie.co.kr/news/1",
            published_at=datetime(2026, 8, 29, 10, 0),
        )], "이소희")
        key = "a-secure-import-key-with-32-bytes"
        result = SpringImportClient("http://localhost:8080", key).submit(article)
        self.assertEqual(result["created"], 1)
        self.assertEqual(post.call_args.kwargs["headers"], {"X-Article-Import-Key": key})
        self.assertEqual(post.call_args.kwargs["json"]["articles"][0]["source"], "rookie")


if __name__ == "__main__":
    unittest.main()
