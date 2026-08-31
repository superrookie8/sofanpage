from datetime import datetime, timedelta
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
from urllib.parse import parse_qs, urlsplit

from crawlers.supersohee_crawlers import cli
from crawlers.supersohee_crawlers.classify import EntityDecision, classify_entity
from crawlers.supersohee_crawlers.cleanup_audit import CleanupAuditError, build_cleanup_audit
from crawlers.supersohee_crawlers.import_client import SpringArticleClient, SpringImportClient
from crawlers.supersohee_crawlers.models import CrawlResult, NormalizedArticle, RawArticle
from crawlers.supersohee_crawlers.pipeline import build_incremental_result
from crawlers.supersohee_crawlers.policy import PolicyConfigError, load_policy_store
from crawlers.supersohee_crawlers.review import review_path, write_review
from crawlers.supersohee_crawlers.sources import JumpballAdapter, RookieAdapter


FIXTURES = Path(__file__).parent / "fixtures"
ROOKIE_DETAIL = (FIXTURES / "rookie-detail.html").read_text(encoding="utf-8")


def article(
    title: str,
    summary: str = "",
    published_at: str = "2026-08-29T12:00:00",
) -> NormalizedArticle:
    return NormalizedArticle(
        source="jumpball",
        title=title,
        url="https://jumpball.co.kr/news/1",
        summary=summary,
        image_url=None,
        published_at=published_at,
    )


def policy(
    policy_id: str,
    effective_from: str,
    effective_to: str,
    target_alias: str,
    namesakes: list[dict] | None = None,
) -> dict:
    return {
        "id": policy_id,
        "season": policy_id,
        "effectiveFrom": effective_from,
        "effectiveTo": effective_to,
        "target": {"teamAliases": [target_alias]},
        "knownNamesakes": namesakes or [],
        "auxiliarySignals": {
            "heightCm": [170],
            "ages": [26],
            "jerseyNumbers": [6],
        },
        "basketballTerms": ["농구", "WKBL"],
        "nonBasketballTerms": ["배드민턴", "축구", "배구"],
    }


def policy_store(policies: list[dict]):
    with TemporaryDirectory(dir="/private/tmp") as directory:
        path = Path(directory) / "identity-policy.json"
        path.write_text(
            json.dumps(
                {"version": 1, "playerName": "이소희", "policies": policies},
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        return load_policy_store(path)


class FakeClient:
    def __init__(self, listing: str, detail: str | None = None):
        self.listing = listing
        self.detail = detail
        self.calls = []

    def get(self, url, params=None):
        self.calls.append((url, params))
        if params:
            html = self.listing
            current = params.get("page")
            if current:
                html = html.replace(
                    '<li class="current user-bg">1</li>',
                    f'<li class="current user-bg">{current}</li>',
                )
            if "pagenum" in params:
                current = int(params["pagenum"]) + 1
                html = html.replace(
                    '<li class="sel"><a href="">1</a></li>',
                    f'<li class="sel"><a href="">{current}</a></li>',
                )
            return html
        if "articleList.html" in url:
            query = parse_qs(urlsplit(url).query)
            current = int(query.get("page", [1])[0])
            return self.listing.replace(
                '<li class="current user-bg">1</li>',
                f'<li class="current user-bg">{current}</li>',
            )
        return self.detail or self.listing

    def post_form(self, url, data):
        self.calls.append((url, data))
        current = int(data.get("page", 1))
        return self.listing.replace(
            '<li class="current user-bg">1</li>',
            f'<li class="current user-bg">{current}</li>',
        )


class PagedFakeClient:
    def __init__(self, pages: dict[int, str], detail: str):
        self.pages = pages
        self.detail = detail
        self.calls = []

    def get(self, url, params=None):
        self.calls.append((url, params))
        if "articleList.html" in url:
            return self.pages[int(parse_qs(urlsplit(url).query)["page"][0])]
        return self.detail

    def post_form(self, url, data):
        self.calls.append((url, data))
        return self.pages[int(data.get("page", 1))]


def rookie_page(published_at: str, current_page: int, page_count: int = 3) -> str:
    next_page = min(current_page + 1, page_count)
    search_word = "%EC%9D%B4%EC%86%8C%ED%9D%AC" if current_page == 1 else ""
    total = page_count * 20
    return f"""
    <div class="view-type"><a href="?page={current_page}&amp;total={total}&amp;sc_word={search_word}&amp;view_type=sm">요약형</a></div>
    <section id="section-list"><ul><li>
      <div class="titles"><a href="/news/articleView.html?idxno={current_page}">대표팀 경기 기사</a></div>
      <div class="lead"><a>검색어가 목록에는 보이지 않는다.</a></div>
      <div class="byline"><em>기자</em><em>{published_at}</em></div>
    </li></ul></section>
    <div class="pagination">
      <strong aria-current="page">{current_page}</strong>
      <a class="next" href="/news/articleList.html?page={next_page}&amp;total={total}&amp;box_idxno=&amp;sc_area=A" title="다음">다음</a>
      <a class="pagination-end" href="/news/articleList.html?page={page_count}&amp;total={total}&amp;box_idxno=&amp;sc_area=A" title="끝">끝</a>
    </div>
    """


class EntityClassificationTests(unittest.TestCase):
    def assert_decision(
        self,
        expected,
        title,
        summary="",
        published_at="2026-08-29T12:00:00",
    ):
        self.assertEqual(
            classify_entity(article(title, summary, published_at)).decision,
            expected,
        )

    def test_only_direct_bnk_attribution_accepts_the_target(self):
        accepted = [
            ("BNK SUM 이소희 맹활약", ""),
            ("BNK 썸 이소희가 승리를 이끌었다", ""),
            ("부산 BNK 썸 소속 이소희 인터뷰", ""),
            ("이소희(BNK 썸)가 골밑을 돌파했다", ""),
            ("BNK 썸 6번 이소희가 코트에 나섰다", ""),
            ("BNK SUM 이소희(171㎝), 26세의 각오", ""),
            ("BNK썸 이소희가 승리를 이끌었다", ""),
            ("BNK 썸의 슈팅가드 이소희 인터뷰", ""),
            ("BNK 썸 소속 슈팅가드 이소희", ""),
            ("이소희(BNK 썸, 가드)가 골밑을 돌파했다", ""),
            ("BNK 썸에서 뛰는 이소희가 20점", ""),
            ("[BNK] 이소희가 출전했다", ""),
            ("이소희 경기 소식", "BNK 썸 이소희가 20점을 기록했다."),
        ]
        for title, summary in accepted:
            with self.subTest(title=title):
                self.assert_decision(EntityDecision.ACCEPT, title, summary)

    def test_player_name_in_title_is_relevant_without_document_fallback(self):
        relevant = [
            "신장 170cm 이소희, 새 시즌 준비",
            "이소희(171㎝)가 골밑을 돌파했다",
            "26세 이소희 인터뷰",
            "이소희(26세), 새 시즌 준비",
            "6번 이소희가 코트에 나섰다",
            "이소희 9번 유니폼 공개",
            "WKBL 농구 국가대표 이소희 출전",
            "WKBL 이소희가 20점을 기록했다",
            "국가대표 이소희 출전",
        ]
        for title in relevant:
            with self.subTest(title=title):
                self.assert_decision(EntityDecision.ACCEPT, title)

    def test_direct_target_auxiliary_with_basketball_context_is_accepted(self):
        accepted = [
            "WKBL 신장 170cm 이소희가 20점을 기록했다",
            "여자농구 이소희(171㎝)가 대표팀에 합류했다",
            "농구 국가대표 26세 이소희 인터뷰",
            "WKBL 6번 이소희가 코트에 나섰다",
            "여자농구 이소희 9번 유니폼 공개",
        ]
        for title in accepted:
            with self.subTest(title=title):
                self.assert_decision(EntityDecision.ACCEPT, title)

    def test_adult_womens_national_team_identity_is_period_policy_target_signal(self):
        accepted = [
            "여자농구 국가대표 이소희가 한일전에 나선다",
            "女대표팀 이소희가 팀 내 최다 득점을 기록했다",
            "女 대표팀 이소희가 일본과 평가전에 나섰다",
            "여자대표팀 핵심 이소희의 각오",
        ]
        for title in accepted:
            with self.subTest(title=title):
                self.assert_decision(EntityDecision.ACCEPT, title)

        self.assert_decision(
            EntityDecision.REJECT,
            "U18 여자농구 대표팀 숙명여고 이소희가 최종 명단에 들었다",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            "U18 여자농구 대표팀 이소희가 최종 명단에 들었다",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            "여자대표팀 이소희와 U18 청소년 대표 이소희가 함께 소개됐다",
        )
        self.assert_decision(
            EntityDecision.AMBIGUOUS,
            "삼성생명 여자대표팀 이소희 합류 소식",
        )

    def test_samsung_life_namesake_is_rejected_and_auxiliary_never_overrides_it(self):
        rejected = [
            "삼성생명 이소희가 데뷔전을 치렀다",
            "용인 삼성생명 블루밍스 선수 이소희 인터뷰",
            "숙명여고 출신 이소희가 프로에 입성했다",
            "이소희(숙명여고)가 삼성생명의 지명을 받았다",
            "이소희[숙명여고]가 드래프트에 참가했다",
            "신장 180cm 이소희, WKBL 도전",
            "신장 181cm 이소희, WKBL 도전",
            "2026 WKBL 신인 드래프트 전체 6순위 이소희",
            "이소희, 2026 신인 드래프트 6순위 지명",
            "삼성생명 이소희(170cm)가 6번 유니폼을 입었다",
        ]
        for title in rejected:
            with self.subTest(title=title):
                self.assert_decision(EntityDecision.REJECT, title)

        classified = classify_entity(article("2026 드래프트 전체 6순위 이소희"))
        self.assertEqual(classified.decision, EntityDecision.REJECT)
        self.assertNotIn("등번호 6/9번 보조 신호", " ".join(classified.reasons))

        self.assert_decision(
            EntityDecision.AMBIGUOUS,
            "삼성생명 WKBL 신장 170cm 이소희 인터뷰",
        )

    def test_broad_team_documents_are_rejected_but_strong_body_news_is_relevant(self):
        rejected = [
            ("‘팀 내 최다 13점’ 女 대표팀, 일본과 평가전", "WKBL 선수들이 경기를 치렀다. 이소희가 외곽에서 분전했다."),
            ("[W 농구월드컵] 한국, 최종예선 승리", "여자농구 국가대표팀이 승리했다. 이소희도 득점에 힘을 보탰다."),
        ]
        for title, summary in rejected:
            with self.subTest(title=title):
                self.assert_decision(EntityDecision.REJECT, title, summary)

        self.assert_decision(
            EntityDecision.ACCEPT,
            "[한일 평가전] 한국, 일본과 대등한 승부",
            "여자대표팀은 빠른 농구를 펼쳤다. 이소희가 팀 내 최다 13점을 기록했다.",
        )
        self.assert_decision(
            EntityDecision.ACCEPT,
            "여자농구 대표팀 최종 명단 발표",
            "최종 명단에 이소희가 포함됐다.",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            "배드민턴 국가대표 평가전",
            "배드민턴 선수 이소희가 출전했다.",
        )

    def test_youth_national_team_title_context_is_namesake_first(self):
        self.assert_decision(
            EntityDecision.REJECT,
            "U18 여자농구 대표팀, 아시아컵 최종 12인 확정",
            "명단에는 이소희도 포함됐다.",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            "청소년 대표팀 소집 명단 발표",
            "BNK 썸 이소희가 명단에 포함됐다고 소개됐다.",
        )

    def test_namesake_event_context_is_limited_to_no_target_signal(self):
        self.assert_decision(
            EntityDecision.REJECT,
            "[포토] 이소희 '나의 탄력을 보세요'",
            "2026 WKBL 신인드래프트 트라이아웃 현장이다.",
        )
        self.assert_decision(
            EntityDecision.ACCEPT,
            "[포토] 이소희가 후배들을 응원",
            "BNK 썸 이소희가 WKBL 신인드래프트 현장을 찾았다.",
        )
        self.assert_decision(
            EntityDecision.ACCEPT,
            "[포토] 이소희 '집중'",
            "WKBL 정규리그 경기 사진이다.",
        )

    def test_high_school_competition_titles_are_period_namesake_events(self):
        cases = [
            ("왕중왕전 숙명여고, 여고부 결승 진출", "2026-08-10T12:00:00"),
            ("왕중왕전 여고부, 치열한 승부", "2026-08-10T12:00:00"),
            ("종별선수권 숙명여고 승리", "2026-07-30T12:00:00"),
            ("연맹회장기 여고부 경기 결과", "2026-05-07T12:00:00"),
            ("춘계대회 숙명여고 첫 승", "2026-03-22T12:00:00"),
        ]
        for title, published_at in cases:
            with self.subTest(title=title):
                self.assert_decision(
                    EntityDecision.REJECT,
                    title,
                    "여자농구 대회에서 이소희가 출전했다.",
                    published_at=published_at,
                )

        self.assert_decision(
            EntityDecision.REJECT,
            "왕중왕전 여고부 현장을 찾은 선배",
            "BNK 썸 이소희가 후배들을 응원했다.",
            published_at="2026-08-10T12:00:00",
        )

    def test_63_spring_tournament_abbreviation_is_a_narrow_2025_26_event(self):
        title = (
            "[63춘계] ‘이수빈 결승골’ 명승부 펼친 숙명과 온양, "
            "숙명이 끝내 웃었다!(종합)"
        )
        self.assert_decision(
            EntityDecision.REJECT,
            title,
            "여고 농구 경기에서 이소희가 출전했다.",
            published_at="2026-03-22T12:00:00",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            title,
            "BNK 썸 이소희가 후배들의 경기를 관전했다.",
            published_at="2026-03-22T12:00:00",
        )

    def test_namesake_event_precedes_broad_adult_document_context(self):
        self.assert_decision(
            EntityDecision.REJECT,
            "W드래프트 고교 최대어, BNK 임연서 지명",
            "여자대표팀은 새 일정을 준비하고 있다. "
            "WKBL 행사에는 이소희도 참석했다.",
            published_at="2026-08-19T12:00:00",
        )

    def test_2025_26_basketball_document_fallback_is_period_limited(self):
        self.assert_decision(
            EntityDecision.REJECT,
            "[포토] 시상식에서 미소 짓는 선수들",
            "WKBL 시상식 현장에는 이소희도 참석했다.",
            published_at="2026-05-10T12:00:00",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            "[포토] 시상식에서 미소 짓는 선수들",
            "WKBL 시상식 현장에는 이소희도 참석했다.",
            published_at="2026-08-10T12:00:00",
        )

    def test_2025_26_basketball_fallback_never_overrides_namesake_title(self):
        self.assert_decision(
            EntityDecision.REJECT,
            "숙명여고, WKBL 유망주를 꿈꾸다",
            "여자농구 선수 이소희가 대회에 출전했다.",
            published_at="2026-05-10T12:00:00",
        )

    def test_title_representative_team_context_is_not_a_relevance_shortcut(self):
        self.assert_decision(
            EntityDecision.REJECT,
            "이번에도 대표팀 외곽 책임지는 강이슬",
            "여자농구 평가전을 앞두고 이소희도 훈련에 참가했다.",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            "강이슬, 외곽에서 맹활약",
            "여자농구 대표팀 훈련에는 이소희도 참가했다.",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            "U18 대표팀, 아시아컵 준비",
            "여자농구 훈련에는 이소희도 참가했다.",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            "배드민턴 대표팀, 국제대회 출전",
            "이소희도 명단에 이름을 올렸다.",
        )

    def test_direct_player_titles_and_strong_body_relevance(self):
        for title in (
            "이소희 18P, 승리 견인",
            "이소희 인터뷰",
            "[포토] 이소희의 미소",
            "코트 위 존재감 보여준 이소희",
            "새 시즌 이소희의 각오",
        ):
            with self.subTest(title=title):
                self.assert_decision(EntityDecision.ACCEPT, title)

        self.assert_decision(
            EntityDecision.ACCEPT,
            "승부처를 바꾼 외곽포",
            "여자농구 경기에서 이소희가 18점을 폭발시켰다.",
        )
        self.assert_decision(
            EntityDecision.ACCEPT,
            "대표팀 훈련 공개",
            "여자농구 대표팀 이소희는 반드시 이기겠다고 말했다.",
        )

    def test_indirect_or_team_only_mentions_are_rejected(self):
        self.assert_decision(
            EntityDecision.REJECT,
            "‘롤 모델은 이소희’ 신인 김민지의 각오",
            "WKBL 신인 김민지가 인터뷰했다.",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            "김민지, 이소희를 롤 모델로 프로 도전",
            "여자농구 신인 김민지 인터뷰다.",
        )
        cases = [
            ("상대 감독이 본 BNK", "경기에는 이소희도 출전했다."),
            ("BNK 박정은 감독 ‘이소희에게 기대’", "WKBL 경기 전망을 밝혔다."),
            ("BNK, 접전 끝 승리", "이소희도 코트를 밟았다."),
            ("WKBL 시상식 개최", "행사에는 이소희도 참석했다."),
            ("여자농구 팝업스토어 오픈", "이소희 관련 상품도 전시됐다."),
            ("오늘 경기 생중계 안내", "이소희가 출전할 예정이다."),
        ]
        for title, summary in cases:
            with self.subTest(title=title):
                self.assert_decision(EntityDecision.REJECT, title, summary)

        self.assert_decision(
            EntityDecision.REJECT,
            "정규리그 마친 BNK",
            "김소니아(20점 11리바운드), 이소희(10점 5어시스트) 등이 분전했다.",
        )

    def test_dynamic_numbers_require_complete_numeric_boundaries(self):
        cases = [
            ("2026 드래프트 전체 16순위 이소희", "드래프트 지명"),
            ("신장 1181cm 이소희", "신장"),
            ("16번 이소희가 출전했다", "등번호"),
            ("126세 이소희 인터뷰", "나이"),
        ]
        for title, forbidden_reason in cases:
            with self.subTest(title=title):
                classified = classify_entity(article(title))
                self.assertEqual(classified.decision, EntityDecision.ACCEPT)
                self.assertNotIn(forbidden_reason, " ".join(classified.reasons))

    def test_game_articles_require_team_to_name_attribution(self):
        self.assert_decision(
            EntityDecision.ACCEPT,
            "BNK 썸 이소희가 삼성생명을 상대로 20점",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            "삼성생명 이소희가 BNK를 상대로 데뷔",
        )
        self.assert_decision(
            EntityDecision.AMBIGUOUS,
            "BNK 썸 이소희, 삼성생명 이소희와 맞대결",
        )
        self.assert_decision(
            EntityDecision.AMBIGUOUS,
            "BNK-삼성생명전 이소희가 주목받았다",
        )

    def test_team_title_context_never_substitutes_for_player_relevance(self):
        self.assert_decision(
            EntityDecision.REJECT,
            "[WKBL 정규리그 결산] 탈락한 BNK의 시즌 여정",
            "시즌 막판 이소희가 외곽에서 분전했다.",
        )
        self.assert_decision(
            EntityDecision.REJECT,
            "안혜지 앞세운 BNK, 우리은행 잡고 PO 경쟁 재점화",
            "이소희도 승부처에서 득점을 보탰다.",
        )
        for title in (
            "갈길 바쁜 BNK 잡아낸 하나은행",
            "신한은행, BNK 추격 뿌리치고 시즌 첫 연승",
            "삼성생명, 연장 접전 끝 BNK 꺾고 승리",
            "하나은행 vs BNK 경기 리뷰",
        ):
            with self.subTest(title=title):
                self.assert_decision(
                    EntityDecision.REJECT,
                    title,
                    "경기에는 이소희도 출전했다.",
                )

    def test_live_review_draft_namesake_signals_override_bnk_document_context(self):
        rejected = [
            (
                "[W드래프트] BNK 임연서 지명",
                "U18 여자농구 청소년 대표 숙명여고 이소희도 드래프트에 참가했다.",
            ),
            (
                "[W드래프트] 포워드 라인 보강한 삼성생명",
                "신장 180cm 숙명여고 이소희가 전체 6순위로 지명됐다.",
            ),
            (
                "[포토] 이소희 '1라운드 6순위로 삼성생명으로'",
                "WKBL 신인 드래프트 현장이다.",
            ),
        ]
        for title, summary in rejected:
            with self.subTest(title=title):
                self.assert_decision(EntityDecision.REJECT, title, summary)

    def test_unrelated_team_or_number_signals_do_not_override_direct_title_relevance(self):
        self.assert_decision(
            EntityDecision.ACCEPT,
            "이소희 인터뷰",
            "상대 BNK 썸을 막았다. 다른 선수 6번 김선수가 활약했다.",
        )
        self.assert_decision(
            EntityDecision.ACCEPT,
            "이소희 근황",
            "김선수는 26세이며 신장 170cm다.",
        )
        self.assert_decision(
            EntityDecision.ACCEPT,
            "이소희가 지켜본 가운데 6번 김민지가 활약했다",
        )
        self.assert_decision(EntityDecision.ACCEPT, "이소희와 6번 김민지가 출전했다")
        self.assert_decision(EntityDecision.ACCEPT, "이소희와 26세 김민지가 인터뷰했다")
        self.assert_decision(EntityDecision.ACCEPT, "이소희와 신장 170cm 김민지가 만났다")
        self.assert_decision(
            EntityDecision.ACCEPT,
            "이소희는 상대 BNK 썸의 수비를 분석했다",
        )

    def test_non_basketball_national_team_is_rejected_and_sport_conflict_is_reviewed(self):
        for sport in ("배드민턴", "축구", "배구"):
            with self.subTest(sport=sport):
                self.assert_decision(
                    EntityDecision.REJECT,
                    f"{sport} 국가대표 이소희가 승리했다",
                )
        self.assert_decision(
            EntityDecision.AMBIGUOUS,
            "여자농구 국가대표 이소희와 배드민턴 국가대표 이소희",
        )
        self.assert_decision(
            EntityDecision.AMBIGUOUS,
            "BNK 썸 이소희",
            "배드민턴 이소희와 동명이인이다",
        )
        self.assert_decision(
            EntityDecision.AMBIGUOUS,
            "이소희는 축구 선수 손흥민을 응원했다",
        )

    def test_identity_phrase_is_reviewable_namesake_rejection(self):
        classified = classify_entity(article("원조 머슬녀 이소희 인터뷰"))
        self.assertEqual(classified.decision, EntityDecision.REJECT)
        self.assertIn("식별 문구", " ".join(classified.reasons))

    def test_policy_date_switch_supports_fa_or_overseas_transfer(self):
        policies = policy_store([
            policy("first-club", "2026-01-01", "2026-06-30", "부산팀"),
            policy("overseas-club", "2026-07-01", "2026-12-31", "도쿄클럽"),
        ])
        self.assertEqual(
            classify_entity(
                article("부산팀 이소희 활약", published_at="2026-06-30T23:59:59"),
                policies,
            ).decision,
            EntityDecision.ACCEPT,
        )
        self.assertEqual(
            classify_entity(
                article("도쿄클럽 이소희 활약", published_at="2026-07-01T00:00:00"),
                policies,
            ).decision,
            EntityDecision.ACCEPT,
        )
        self.assertEqual(
            classify_entity(
                article("부산팀 이소희 이적 후 근황", published_at="2026-07-01T00:00:00"),
                policies,
            ).decision,
            EntityDecision.ACCEPT,
        )

    def test_default_backfill_policy_selects_each_season_at_date_boundary(self):
        before = classify_entity(
            article("BNK 썸 이소희 활약", published_at="2026-06-30T23:59:59")
        )
        after = classify_entity(
            article("BNK 썸 이소희 활약", published_at="2026-07-01T00:00:00")
        )
        self.assertEqual(before.decision, EntityDecision.ACCEPT)
        self.assertIn("2025-26-bnk", " ".join(before.reasons))
        self.assertEqual(after.decision, EntityDecision.ACCEPT)
        self.assertIn("2026-27-bnk", " ".join(after.reasons))

        # The later professional namesake policy is not applied retroactively.
        old_namesake = classify_entity(
            article("삼성생명 이소희 데뷔", published_at="2026-06-30T12:00:00")
        )
        self.assertEqual(old_namesake.decision, EntityDecision.ACCEPT)

    def test_missing_policy_is_ambiguous_and_overlapping_policy_is_invalid(self):
        policies = policy_store([
            policy("known-season", "2026-07-01", "2027-06-30", "확인팀"),
        ])
        classified = classify_entity(
            article("확인팀 이소희", published_at="2026-06-30T12:00:00"),
            policies,
        )
        self.assertEqual(classified.decision, EntityDecision.AMBIGUOUS)
        self.assertIn("정책이 없음", " ".join(classified.reasons))

        with self.assertRaises(PolicyConfigError):
            policy_store([
                policy("period-a", "2026-01-01", "2026-08-01", "첫팀"),
                policy("period-b", "2026-08-01", "2026-12-31", "둘째팀"),
            ])

        unsafe_context = policy(
            "unsafe-context", "2026-01-01", "2026-12-31", "확인팀"
        )
        unsafe_context["target"]["allowTitleTeamContext"] = True
        with self.assertRaisesRegex(PolicyConfigError, "titleObjectPredicates"):
            policy_store([unsafe_context])


class IncrementalPipelineTests(unittest.TestCase):
    def raw(self, when: datetime, title="BNK 썸 이소희 활약", suffix="1"):
        return RawArticle(
            source="jumpball",
            title=title,
            url=f"https://jumpball.co.kr/news/{suffix}",
            summary="BNK 썸 이소희가 활약했다.",
            published_at=when,
        )

    def test_watermark_boundary_is_inclusive_and_idempotent_overlap_is_kept(self):
        watermark = datetime(2026, 8, 23, 10, 0)
        crawl = CrawlResult(
            articles=[self.raw(watermark + timedelta(days=1), suffix="new"), self.raw(watermark, suffix="boundary")],
            pages_crawled=2,
            available_pages=5,
            watermark_reached=True,
            missing_dates=0,
            chronology_valid=True,
        )
        result = build_incremental_result("jumpball", crawl, watermark, "이소희")
        self.assertEqual([item.url.rsplit("/", 1)[-1] for item in result.accepted], ["new", "boundary"])
        self.assertTrue(result.safe_to_submit)

    def test_submit_is_blocked_before_boundary_or_for_missing_date_or_ambiguous(self):
        watermark = datetime(2026, 1, 23, 10, 0)
        crawl = CrawlResult(
            articles=[RawArticle(
                source="jumpball", title="농구와 배드민턴 국가대표 이소희", url="https://jumpball.co.kr/news/ambiguous",
                summary="", published_at=watermark + timedelta(days=1),
            )],
            pages_crawled=10,
            available_pages=20,
            watermark_reached=False,
            missing_dates=1,
            chronology_valid=True,
        )
        result = build_incremental_result("jumpball", crawl, watermark, "이소희")
        self.assertFalse(result.safe_to_submit)
        self.assertEqual(len(result.ambiguous), 1)
        self.assertEqual(len(result.safety_errors), 3)

    def test_source_adapters_keep_scanning_equal_timestamp_until_search_end(self):
        jumpball_list = (FIXTURES / "jumpball-list.html").read_text(encoding="utf-8")
        jumpball_detail = (FIXTURES / "jumpball-detail.html").read_text(encoding="utf-8")
        jumpball = JumpballAdapter(FakeClient(jumpball_list, jumpball_detail)).crawl(
            "이소희", 3, datetime(2026, 8, 28, 14, 30)
        )
        self.assertFalse(jumpball.watermark_reached)
        self.assertEqual(jumpball.pages_crawled, 3)

        rookie = RookieAdapter(PagedFakeClient({
            page: rookie_page("2026.08.26 18:20", page, page_count=4)
            for page in range(1, 5)
        }, ROOKIE_DETAIL)).crawl(
            "이소희", 4, datetime(2026, 8, 26, 18, 20)
        )
        self.assertTrue(rookie.watermark_reached)
        self.assertEqual(rookie.pages_crawled, 4)

    def test_source_requests_follow_live_search_contracts(self):
        jumpball_list = (FIXTURES / "jumpball-list.html").read_text(encoding="utf-8")
        jumpball_detail = (FIXTURES / "jumpball-detail.html").read_text(encoding="utf-8")
        jumpball_client = FakeClient(jumpball_list, jumpball_detail)
        JumpballAdapter(jumpball_client).crawl("이소희", 2, datetime(2020, 1, 1))
        listing_calls = [call for call in jumpball_client.calls if call[1] is not None]
        self.assertEqual(listing_calls[0][1], {
            "q": "이소희", "sfld": "all", "period": "MONTH|12",
        })
        self.assertEqual(listing_calls[1][1], {
            "q": "이소희", "sfld": "all", "period": "MONTH|12", "pagenum": 1,
        })

        rookie_client = PagedFakeClient({
            1: (FIXTURES / "rookie-list.html").read_text(encoding="utf-8"),
            2: (FIXTURES / "rookie-page2.html").read_text(encoding="utf-8"),
        }, ROOKIE_DETAIL)
        RookieAdapter(rookie_client).crawl("이소희", 2, datetime(2020, 1, 1))
        self.assertEqual(rookie_client.calls[0][1], {
            "sc_area": "A", "sc_word": "이소희", "view_type": "sm",
        })
        page_calls = [
            call for call in rookie_client.calls
            if "articleList.html" in call[0]
            and call[1] is not None
            and "page" in call[1]
        ]
        self.assertEqual(page_calls, [(
            "https://www.rookie.co.kr/news/articleList.html",
            {
                "page": 2,
                "total": 1232,
                "box_idxno": "",
                "sc_area": "A",
                "sc_word": "이소희",
                "view_type": "sm",
            },
        )])

    def test_rookie_all_articles_response_fails_before_pagination(self):
        all_articles = """
        <div class="view-type"><a href="?page=1&total=103022&sc_word=">요약형</a></div>
        <section id="section-list"><ul><li>
          <h4 class="titles"><a href="/news/1">전체 기사</a></h4>
        </li></ul></section>
        <ul class="pagination"><li class="pagination-end">
          <a href="?page=5152&total=103022" title="끝">끝</a>
        </li></ul>
        """
        with self.assertRaisesRegex(RuntimeError, "identity could not be verified"):
            RookieAdapter(FakeClient(all_articles)).crawl("이소희", 1, None)

    def test_source_adapter_marks_capped_scan_incomplete(self):
        jumpball_list = (FIXTURES / "jumpball-list.html").read_text(encoding="utf-8")
        jumpball_detail = (FIXTURES / "jumpball-detail.html").read_text(encoding="utf-8")
        result = JumpballAdapter(FakeClient(jumpball_list, jumpball_detail)).crawl(
            "이소희", 2, datetime(2020, 1, 1)
        )
        self.assertFalse(result.watermark_reached)
        self.assertEqual(result.pages_crawled, 2)

    def test_missing_dynamic_search_pagination_fails_closed(self):
        rookie_list = (FIXTURES / "rookie-list.html").read_text(encoding="utf-8")
        one_page = rookie_list.split('<nav aria-label="Pagination">', 1)[0]
        with self.assertRaisesRegex(RuntimeError, "identity could not be verified"):
            RookieAdapter(FakeClient(one_page, ROOKIE_DETAIL)).crawl(
                "이소희", 1, datetime(2020, 1, 1)
            )

    def test_equal_watermark_on_capped_page_does_not_skip_same_time_next_page(self):
        client = PagedFakeClient({
            1: rookie_page("2026.01.24 09:00", 1),
            2: rookie_page("2026.01.23 09:00", 2),
            3: rookie_page("2026.01.22 09:00", 3),
        }, ROOKIE_DETAIL)
        capped = RookieAdapter(client).crawl("이소희", 2, datetime(2026, 1, 23, 9, 0))
        self.assertFalse(capped.watermark_reached)
        complete = RookieAdapter(client).crawl("이소희", 3, datetime(2026, 1, 23, 9, 0))
        self.assertTrue(complete.watermark_reached)
        self.assertEqual(complete.pages_crawled, 3)

    def test_empty_source_without_dynamic_identity_fails_closed(self):
        recognized_empty = (
            '<div class="view-type"><a href="?sc_word=%EC%9D%B4%EC%86%8C%ED%9D%AC">검색</a></div>'
            '<section id="section-list"><ul></ul></section>'
        )
        with self.assertRaisesRegex(RuntimeError, "identity could not be verified"):
            RookieAdapter(FakeClient(recognized_empty)).crawl("이소희", 1, None)

    def test_empty_watermark_does_not_complete_without_terminal_pagination_proof(self):
        nonempty_without_pagination = rookie_page("2026.01.24 09:00", 1).split(
            '<div class="pagination">', 1
        )[0]
        with self.assertRaisesRegex(RuntimeError, "identity could not be verified"):
            RookieAdapter(FakeClient(nonempty_without_pagination, ROOKIE_DETAIL)).crawl(
                "이소희", 10, None
            )

    def test_page_two_dom_drift_is_not_mistaken_for_an_empty_terminal_page(self):
        first = rookie_page("2026.01.24 09:00", 1, page_count=2)
        with self.assertRaisesRegex(RuntimeError, "pagination identity changed"):
            RookieAdapter(PagedFakeClient({
                1: first,
                2: (
                    '<div class="view-type"><a href="?sc_word=%EC%9D%B4%EC%86%8C%ED%9D%AC">검색</a></div>'
                    '<section id="section-list"><ul>'
                    '<article>listing item selector changed</article>'
                    '</ul></section>'
                ),
            }, ROOKIE_DETAIL)).crawl("이소희", 2, None)

        wrong_current_marker = rookie_page(
            "2026.01.23 09:00", 2, page_count=2
        ).replace(
            '<strong aria-current="page">2</strong>',
            '<strong aria-current="page">1</strong>',
        )
        with self.assertRaisesRegex(RuntimeError, "pagination identity changed"):
            RookieAdapter(PagedFakeClient({
                1: first,
                2: wrong_current_marker,
            }, ROOKIE_DETAIL)).crawl("이소희", 2, None)

        missing_current_marker = rookie_page(
            "2026.01.23 09:00", 2, page_count=2
        ).replace(
            '<strong aria-current="page">2</strong>',
            '<strong>2</strong>',
        )
        with self.assertRaisesRegex(RuntimeError, "pagination identity changed"):
            RookieAdapter(PagedFakeClient({
                1: first,
                2: missing_current_marker,
            }, ROOKIE_DETAIL)).crawl("이소희", 2, None)

    def test_rookie_page_two_uses_dynamic_form_post_and_detail_keyword(self):
        first = (FIXTURES / "rookie-list.html").read_text(encoding="utf-8")
        second = (FIXTURES / "rookie-page2.html").read_text(encoding="utf-8")
        client = PagedFakeClient({1: first, 2: second}, ROOKIE_DETAIL)

        result = RookieAdapter(client).crawl("이소희", 2, datetime(2020, 1, 1))

        self.assertEqual(result.pages_crawled, 2)
        page_two_articles = [article for article in result.articles if "idxno=20" in article.url]
        self.assertEqual(len(page_two_articles), 1)
        self.assertIn("이소희", page_two_articles[0].summary)
        page_two_calls = [
            call for call in client.calls
            if call[1] is not None and call[1].get("page") == 2
        ]
        self.assertEqual(len(page_two_calls), 1)
        self.assertEqual(page_two_calls[0][1]["total"], 1232)
        self.assertEqual(page_two_calls[0][1]["sc_word"], "이소희")


class BackendAndReviewTests(unittest.TestCase):
    def test_cleanup_audit_requires_full_summary_and_never_mutates(self):
        payload = {
            "documents": [
                {
                    "_id": {"$oid": "keep-id"},
                    "source": "jumpball",
                    "title": "이소희 인터뷰",
                    "url": "https://jumpball.co.kr/news/keep",
                    "summary": "이소희가 새 시즌 각오를 밝혔다.",
                    "publishedAt": {"$date": "2026-08-20T12:00:00Z"},
                },
                {
                    "_id": {"$oid": "delete-id"},
                    "source": "rookie",
                    "title": "BNK, 접전 끝 승리",
                    "url": "https://www.rookie.co.kr/news/delete",
                    "summary": "경기에는 이소희도 출전했다.",
                    "publishedAt": {"$date": "2026-08-20T12:00:00Z"},
                },
                {
                    "_id": {"$oid": "review-id"},
                    "source": "jumpball",
                    "title": "BNK-삼성생명전 이소희가 주목받았다",
                    "url": "https://jumpball.co.kr/news/review",
                    "summary": "WKBL 경기 기사다.",
                    "publishedAt": {"$date": "2026-08-20T12:00:00Z"},
                },
            ]
        }
        audit = build_cleanup_audit(payload)
        self.assertFalse(audit["mutationPerformed"])
        self.assertEqual(
            audit["counts"],
            {"keep": 1, "deleteCandidate": 1, "manualReview": 1},
        )
        self.assertEqual(
            [row["action"] for row in audit["documents"]],
            ["KEEP", "DELETE_CANDIDATE", "MANUAL_REVIEW"],
        )
        self.assertNotIn("summary", audit["documents"][0])

        without_summary = {"documents": [{
            key: value
            for key, value in payload["documents"][0].items()
            if key != "summary"
        }]}
        with self.assertRaisesRegex(CleanupAuditError, "summary"):
            build_cleanup_audit(without_summary)

    @patch("crawlers.supersohee_crawlers.import_client.requests.get")
    def test_public_source_endpoint_returns_latest_watermark_without_import_key(self, get: Mock):
        response = Mock()
        response.is_redirect = False
        response.is_permanent_redirect = False
        response.json.return_value = {"articles": [{
            "source": "jumpball", "publishedAt": "2026-01-23T10:30:00"
        }]}
        get.return_value = response
        watermark = SpringArticleClient("http://localhost:8080").latest_published_at("jumpball")
        self.assertEqual(watermark, datetime(2026, 1, 23, 10, 30))
        self.assertEqual(get.call_args.kwargs["params"], {"page": 0, "limit": 1})
        self.assertNotIn("headers", get.call_args.kwargs)

    @patch("crawlers.supersohee_crawlers.import_client.requests.get")
    def test_watermark_offsets_are_seoul_local_and_floored_to_source_precision(self, get: Mock):
        response = Mock()
        response.is_redirect = False
        response.is_permanent_redirect = False
        get.return_value = response

        response.json.return_value = {"articles": [{
            "source": "jumpball",
            "publishedAt": "2026-01-23T10:30:00.987654+09:00",
        }]}
        self.assertEqual(
            SpringArticleClient("http://localhost:8080").latest_published_at("jumpball"),
            datetime(2026, 1, 23, 10, 30, 0),
        )

        response.json.return_value = {"articles": [{
            "source": "rookie",
            "publishedAt": "2026-01-23T00:15:59.999Z",
        }]}
        self.assertEqual(
            SpringArticleClient("http://localhost:8080").latest_published_at("rookie"),
            datetime(2026, 1, 23, 9, 15, 0),
        )

    @patch("crawlers.supersohee_crawlers.import_client.requests.post")
    def test_import_batches_are_at_most_200_and_oldest_first(self, post: Mock):
        def response(*_, **kwargs):
            result = Mock()
            result.is_redirect = False
            result.is_permanent_redirect = False
            count = len(kwargs["json"]["articles"])
            result.json.return_value = {"processed": count, "created": count, "existing": 0}
            return result

        post.side_effect = response
        articles = [NormalizedArticle(
            source="jumpball",
            title=f"BNK 썸 이소희 {index}",
            url=f"https://jumpball.co.kr/news/{index:03d}",
            summary="",
            image_url=None,
            published_at=(datetime(2026, 1, 1) + timedelta(minutes=index)).isoformat(),
        ) for index in reversed(range(201))]
        result = SpringImportClient(
            "http://localhost:8080", "a-secure-import-key-with-32-bytes"
        ).submit_oldest_first(articles)
        self.assertEqual(result, {"processed": 201, "created": 201, "existing": 0, "batches": 2})
        self.assertEqual([len(call.kwargs["json"]["articles"]) for call in post.call_args_list], [200, 1])
        self.assertTrue(post.call_args_list[0].kwargs["json"]["articles"][0]["url"].endswith("/000"))

    def test_review_output_is_bounded_to_private_tmp_and_contains_no_summary(self):
        crawl = CrawlResult(
            articles=[RawArticle(
                source="jumpball", title="BNK 썸 이소희", url="https://jumpball.co.kr/news/1",
                summary="짧은 목록 요약", published_at=datetime(2026, 8, 24),
            )],
            pages_crawled=1, available_pages=1, watermark_reached=True,
            missing_dates=0, chronology_valid=True,
        )
        result = build_incremental_result("jumpball", crawl, datetime(2026, 8, 23), "이소희")
        with TemporaryDirectory(dir="/private/tmp") as directory:
            path = review_path(str(Path(directory) / "review.json"))
            write_review([result], path)
            text = path.read_text(encoding="utf-8")
            self.assertIn('"decision": "accept"', text)
            self.assertNotIn("짧은 목록 요약", text)
        with self.assertRaises(ValueError):
            review_path("/Users/example/review.json")


class CliPreflightTests(unittest.TestCase):
    def args(self, **changes):
        values = {
            "source": "jumpball",
            "keyword": "이소희",
            "max_pages": 1,
            "timeout": 10,
            "retries": 0,
            "pace_seconds": 0,
            "review_output": None,
            "identity_policy": "crawlers/config/player_identity_policies.json",
            "submit": False,
        }
        values.update(changes)
        return SimpleNamespace(**values)

    def test_keyword_mismatch_fails_before_backend_or_article_site_client(self):
        with patch.object(cli, "parse_args", return_value=self.args(keyword="김민지")), \
             patch.object(cli, "SpringArticleClient") as article_client, \
             patch.object(cli, "JumpballAdapter") as adapter:
            with self.assertRaisesRegex(SystemExit, "identity policy playerName"):
                cli.main()
        article_client.assert_not_called()
        adapter.assert_not_called()

    def test_submit_key_is_validated_before_any_external_client_crawl(self):
        with patch.object(cli, "parse_args", return_value=self.args(submit=True)), \
             patch.object(cli, "JumpballAdapter") as adapter, \
             patch.dict(
                 "os.environ",
                 {"SUPERSOHEE_BACKEND_URL": "http://localhost:8080"},
                 clear=True,
             ):
            with self.assertRaisesRegex(ValueError, "IMPORT_KEY"):
                cli.main()
        adapter.assert_not_called()


if __name__ == "__main__":
    unittest.main()
