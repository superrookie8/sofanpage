from dataclasses import dataclass
from enum import Enum
import re

from .models import NormalizedArticle
from .policy import RelevancePolicy


class RelevanceDecision(str, Enum):
    RELEVANT = "relevant"
    IRRELEVANT = "irrelevant"


@dataclass(frozen=True)
class RelevanceResult:
    decision: RelevanceDecision
    reason: str


SENTENCE_SPLIT = re.compile(r"[.!?。！？\n]+")


def _alternatives(values: tuple[str, ...]) -> str:
    return "(?:" + "|".join(
        re.escape(value) for value in sorted(values, key=len, reverse=True)
    ) + ")"


def _is_indirect_title(title: str, player_name: str, phrases: tuple[str, ...]) -> bool:
    if not phrases:
        return False
    phrase = _alternatives(phrases)
    name = re.escape(player_name)
    return bool(
        re.search(
            rf"(?:{phrase})(?:은|는|로|으로|:)?\s*.{{0,8}}{name}|"
            rf"{name}(?:을|를|에게|에\s*대한|를\s*향한)\s*.{{0,12}}"
            rf"(?:{phrase})(?:로|으로)?",
            title,
            re.IGNORECASE,
        )
    )


def _has_strong_body_relevance(
    sentence: str,
    title: str,
    player_name: str,
    policy: RelevancePolicy,
) -> str | None:
    name = re.escape(player_name)
    if policy.body_selection_phrases:
        selection = _alternatives(policy.body_selection_phrases)
        if re.search(selection, title, re.IGNORECASE) and re.search(
            rf"(?:{selection}.{{0,40}}{name}|{name}.{{0,40}}{selection})",
            sentence,
            re.IGNORECASE,
        ):
            return "본문 같은 문장의 공식 명단·발탁 소식"
    if policy.body_quote_verbs:
        quote = _alternatives(policy.body_quote_verbs)
        if re.search(
            rf"{name}(?:은|는|이|가)\s*.{{0,100}}(?<![가-힣])(?:{quote})(?![가-힣])",
            sentence,
            re.IGNORECASE,
        ):
            return "본문 같은 문장의 선수 직접 발언"
    if policy.body_record_units and policy.body_record_qualifiers:
        unit = _alternatives(policy.body_record_units)
        qualifier = _alternatives(policy.body_record_qualifiers)
        named_box_scores = re.findall(r"[가-힣]{2,4}\s*\(", sentence)
        if (
            len(named_box_scores) <= 1
            and re.search(qualifier, sentence, re.IGNORECASE)
            and re.search(
            rf"(?:{name}.{{0,30}}(?<!\d)\d+(?:\.\d+)?\s*{unit}"
            rf"(?:을|를|은|는|이|가|도|으로|에서)?(?![가-힣A-Za-z0-9])|"
            rf"(?<!\d)\d+(?:\.\d+)?\s*{unit}"
            rf"(?:을|를|은|는|이|가|도|으로|에서)?(?![가-힣A-Za-z0-9]).{{0,30}}{name})",
            sentence,
            re.IGNORECASE,
            )
        ):
            return "본문 같은 문장의 선수 개인 기록"
    return None


def classify_relevance(
    article: NormalizedArticle,
    player_name: str,
    policy: RelevancePolicy,
) -> RelevanceResult:
    if player_name in article.title:
        if _is_indirect_title(article.title, player_name, policy.indirect_title_phrases):
            return RelevanceResult(
                RelevanceDecision.IRRELEVANT,
                "제목에서 다른 인물의 롤모델·간접 언급으로 확인됨",
            )
        return RelevanceResult(
            RelevanceDecision.RELEVANT,
            "제목에 선수 이름이 직접 표기됨",
        )

    if policy.irrelevant_title_phrases:
        irrelevant = _alternatives(policy.irrelevant_title_phrases)
        if re.search(irrelevant, article.title, re.IGNORECASE):
            return RelevanceResult(
                RelevanceDecision.IRRELEVANT,
                "제목이 일반 경기 결과·행사·중계 중심 기사임",
            )

    for sentence in (
        part.strip()
        for part in SENTENCE_SPLIT.split(article.summary)
        if part.strip() and player_name in part
    ):
        reason = _has_strong_body_relevance(
            sentence,
            article.title,
            player_name,
            policy,
        )
        if reason:
            return RelevanceResult(RelevanceDecision.RELEVANT, reason)

    return RelevanceResult(
        RelevanceDecision.IRRELEVANT,
        "제목에 선수 이름이 없고 본문에도 직접 명단·발언·개인 기록 근거가 없음",
    )
