from dataclasses import dataclass
from enum import Enum
from functools import lru_cache
import re

from .models import NormalizedArticle
from .policy import (
    IdentityPolicyStore,
    KnownNamesake,
    load_default_policy_store,
)
from .relevance import RelevanceDecision, classify_relevance


class EntityDecision(str, Enum):
    ACCEPT = "accept"
    REJECT = "reject"
    AMBIGUOUS = "ambiguous"


@dataclass(frozen=True)
class ClassifiedArticle:
    article: NormalizedArticle
    decision: EntityDecision
    reasons: tuple[str, ...]

    def as_review_dict(self) -> dict:
        return {
            "source": self.article.source,
            "title": self.article.title,
            "url": self.article.url,
            "publishedAt": self.article.published_at,
            "decision": self.decision.value,
            "reasons": list(self.reasons),
        }


SENTENCE_SPLIT = re.compile(r"[.!?。！？\n]+")


def _alternatives(values: tuple[str, ...]) -> str:
    return "(?:" + "|".join(
        re.escape(value) for value in sorted(values, key=len, reverse=True)
    ) + ")"


def _flexible_alternatives(values: tuple[str, ...]) -> str:
    patterns = []
    for value in sorted(values, key=len, reverse=True):
        patterns.append(r"\s*".join(re.escape(part) for part in value.split()))
    return "(?:" + "|".join(patterns) + ")"


def _number_alternatives(values: tuple[int, ...]) -> str:
    ordered = sorted(set(values), key=lambda value: (-len(str(value)), value))
    return r"(?<!\d)(?:" + "|".join(str(value) for value in ordered) + r")(?!\d)"


@lru_cache(maxsize=64)
def _team_name_pattern(aliases: tuple[str, ...], player_name: str) -> re.Pattern:
    team = _flexible_alternatives(aliases)
    name = re.escape(player_name)
    role = r"(?:슈팅\s*가드|포인트\s*가드|가드|선수)"
    jersey = r"(?:(?:등번호\s*)?(?<!\d)\d+(?!\d)\s*번\s*)?"
    # Direct attribution only: fixture labels and opponent mentions do not match.
    return re.compile(
        rf"(?:{team}\s*(?:에서\s*(?:뛰는|활약하는)\s*{name}|"
        rf"(?:소속\s*)?(?:의\s*)?(?:(?:여자)?농구\s*)?{jersey}(?:{role}\s*)?{name})|"
        rf"[\(\[]\s*{team}\s*[\)\]]\s*{name}|"
        rf"{name}\s*[\(\[]\s*{team}(?:\s*[,·/]\s*(?:{role}|G))?\s*[\)\]]|"
        rf"{name}(?:\s*선수)?(?:는|은|가|의)?\s*{team}\s*(?:소속|{role}))",
        re.IGNORECASE,
    )


@lru_cache(maxsize=64)
def _school_name_pattern(aliases: tuple[str, ...], player_name: str) -> re.Pattern:
    school = _flexible_alternatives(aliases)
    name = re.escape(player_name)
    return re.compile(
        rf"(?:{school}(?:에|에서|의)?\s*(?:재학\s*중인|뛰는|활약하는|"
        rf"출신|소속)?\s*(?:가드\s*|선수\s*)?{name}|"
        rf"{name}\s*[\(\[]\s*{school}(?:\s*[,·/]\s*(?:가드|선수))?\s*[\)\]]|"
        rf"{name}(?:\s*선수)?(?:는|은|가|의)?\s*{school}\s*(?:출신|소속|선수))",
        re.IGNORECASE,
    )


@lru_cache(maxsize=64)
def _height_name_pattern(values: tuple[int, ...], player_name: str) -> re.Pattern:
    heights = _number_alternatives(values)
    name = re.escape(player_name)
    return re.compile(
        rf"(?:(?:신장\s*)?{heights}\s*(?:cm|㎝|센티미터)(?:의|인)?\s*.{{0,4}}{name}|"
        rf"{name}\s*[\(\[,/-]\s*(?:신장\s*)?{heights}\s*(?:cm|㎝|센티미터))",
        re.IGNORECASE,
    )


@lru_cache(maxsize=64)
def _age_name_pattern(values: tuple[int, ...], player_name: str) -> re.Pattern:
    ages = _number_alternatives(values)
    name = re.escape(player_name)
    return re.compile(
        rf"(?:{ages}\s*세(?:의)?\s*.{{0,4}}{name}|"
        rf"{name}\s*[\(\[,/-]\s*{ages}\s*세)"
    )


@lru_cache(maxsize=64)
def _jersey_name_pattern(values: tuple[int, ...], player_name: str) -> re.Pattern:
    numbers = _number_alternatives(values)
    name = re.escape(player_name)
    # `번` is mandatory, so an overall draft pick can never become a jersey.
    return re.compile(
        rf"(?:(?:등번호\s*)?{numbers}\s*번\s*.{{0,4}}{name}|"
        rf"{name}(?:의\s*등번호(?:는)?\s*{numbers}\s*번|"
        rf"\s+{numbers}\s*번\s*(?:유니폼|등번호)))"
    )


@lru_cache(maxsize=64)
def _draft_name_pattern(year: int, overall: int, player_name: str) -> re.Pattern:
    name = re.escape(player_name)
    draft_year = _number_alternatives((year,))
    pick = _number_alternatives((overall,))
    return re.compile(
        rf"(?:{draft_year}(?:년)?\s*(?:WKBL\s*)?(?:신인\s*)?"
        rf"드래프트.{{0,12}}(?:전체\s*)?{pick}\s*순위.{{0,8}}{name}|"
        rf"{name}.{{0,8}}{draft_year}(?:년)?\s*(?:WKBL\s*)?(?:신인\s*)?"
        rf"드래프트.{{0,12}}(?:전체\s*)?{pick}\s*순위|"
        rf"(?:WKBL\s*)?(?:신인\s*)?(?:드래프트|1\s*라운드).{{0,12}}"
        rf"(?:전체\s*)?{pick}\s*순위.{{0,12}}{name}|"
        rf"{name}.{{0,12}}(?:WKBL\s*)?(?:신인\s*)?"
        rf"(?:드래프트|1\s*라운드).{{0,12}}(?:전체\s*)?{pick}\s*순위)",
        re.IGNORECASE,
    )


@lru_cache(maxsize=64)
def _terms_pattern(values: tuple[str, ...]) -> re.Pattern:
    return re.compile(_alternatives(values), re.IGNORECASE)


@lru_cache(maxsize=64)
def _sport_name_pattern(values: tuple[str, ...], player_name: str) -> re.Pattern:
    sport = _flexible_alternatives(values)
    name = re.escape(player_name)
    return re.compile(
        rf"(?:{sport}\s*(?:(?:국가대표|선수)\s*)?{name}|"
        rf"[\(\[]\s*{sport}\s*[\)\]]\s*{name}|"
        rf"{name}\s*[\(\[]\s*{sport}\s*[\)\]])",
        re.IGNORECASE,
    )


@lru_cache(maxsize=64)
def _phrase_name_pattern(values: tuple[str, ...], player_name: str) -> re.Pattern:
    phrase = _flexible_alternatives(values)
    name = re.escape(player_name)
    return re.compile(
        rf"(?:{phrase}.{{0,12}}{name}|{name}.{{0,12}}{phrase})",
        re.IGNORECASE,
    )


def _distance(left: tuple[int, int], right: tuple[int, int]) -> int:
    if left[1] < right[0]:
        return right[0] - left[1]
    if right[1] < left[0]:
        return left[0] - right[1]
    return 0


def _near(sentence: str, player_name: str, pattern: re.Pattern, max_distance: int) -> bool:
    names = [match.span() for match in re.finditer(re.escape(player_name), sentence)]
    signals = [match.span() for match in pattern.finditer(sentence)]
    return any(_distance(name, signal) <= max_distance for name in names for signal in signals)


def _unique(items: list[str]) -> tuple[str, ...]:
    return tuple(dict.fromkeys(items))


def _has_phrase(text: str, phrases: tuple[str, ...]) -> bool:
    return bool(
        phrases
        and re.search(_flexible_alternatives(phrases), text, re.IGNORECASE)
    )


def _has_namesake_document_signal(text: str, namesake: KnownNamesake) -> bool:
    phrase_groups = (
        namesake.team_aliases,
        namesake.school_aliases,
        namesake.identity_phrases,
        namesake.title_identity_phrases,
        namesake.event_identity_phrases,
    )
    if any(_has_phrase(text, phrases) for phrases in phrase_groups):
        return True
    if namesake.height_cm:
        heights = _number_alternatives(namesake.height_cm)
        if re.search(
            rf"{heights}\s*(?:cm|㎝|센티미터)",
            text,
            re.IGNORECASE,
        ):
            return True
    for pick in namesake.draft_picks:
        year = _number_alternatives((pick.year,))
        overall = _number_alternatives((pick.overall,))
        if re.search(year, text) and re.search(
            rf"(?:드래프트|1\s*라운드).{{0,20}}(?:전체\s*)?{overall}\s*순위",
            text,
            re.IGNORECASE,
        ):
            return True
    return False


def _title_team_context(
    title: str,
    team_aliases: tuple[str, ...],
    opponent_prefixes: tuple[str, ...],
    object_predicates: tuple[str, ...],
) -> bool:
    team = _flexible_alternatives(team_aliases)
    if not re.search(team, title, re.IGNORECASE):
        return False
    if opponent_prefixes:
        prefixes = _flexible_alternatives(opponent_prefixes)
        if re.search(
            rf"(?:^|[\s,·/:-]){prefixes}\s*{team}",
            title,
            re.IGNORECASE,
        ):
            return False
    if not object_predicates:
        return True
    predicates = _flexible_alternatives(object_predicates)
    return not re.search(
        rf"{team}\s*(?:을|를)?\s*{predicates}",
        title,
        re.IGNORECASE,
    )


def _namesake_reasons(
    sentence: str,
    player_name: str,
    namesake: KnownNamesake,
) -> list[str]:
    reasons = []
    if namesake.team_aliases and _team_name_pattern(
        namesake.team_aliases, player_name
    ).search(sentence):
        reasons.append(f"{namesake.label}: 이름에 직접 귀속된 소속팀")
    if namesake.school_aliases and _school_name_pattern(
        namesake.school_aliases, player_name
    ).search(sentence):
        reasons.append(f"{namesake.label}: 이름에 연결된 학교")
    if namesake.identity_phrases and _phrase_name_pattern(
        namesake.identity_phrases, player_name
    ).search(sentence):
        reasons.append(f"{namesake.label}: 이름에 연결된 식별 문구")
    if namesake.height_cm and _height_name_pattern(
        namesake.height_cm, player_name
    ).search(sentence):
        reasons.append(f"{namesake.label}: 이름에 연결된 신장")
    for pick in namesake.draft_picks:
        if _draft_name_pattern(pick.year, pick.overall, player_name).search(sentence):
            reasons.append(f"{namesake.label}: 이름에 연결된 드래프트 지명")
    return reasons


def classify_entity(
    article: NormalizedArticle,
    policy_store: IdentityPolicyStore | None = None,
) -> ClassifiedArticle:
    store = policy_store or load_default_policy_store()
    policy = store.policy_for(article.published_at)
    if policy is None:
        return ClassifiedArticle(
            article,
            EntityDecision.AMBIGUOUS,
            ("기사 게시일을 포괄하는 선수 식별 정책이 없음",),
        )

    player_name = store.player_name
    text = f"{article.title}\n{article.summary}"
    if player_name not in text:
        return ClassifiedArticle(
            article,
            EntityDecision.REJECT,
            (f"{policy.policy_id}: 정책 선수 이름 없음",),
        )
    relevance = classify_relevance(article, player_name, store.relevance)

    target_team = False
    target_identity = False
    namesake_title_reasons: list[str] = []
    namesake_event_reasons: list[str] = []
    namesake_reasons: list[str] = []
    auxiliary_reasons: list[str] = []
    basketball = False
    non_basketball_direct = False
    non_basketball_near = False
    target_pattern = _team_name_pattern(policy.target_team_aliases, player_name)
    target_identity_pattern = (
        _phrase_name_pattern(policy.target_identity_phrases, player_name)
        if policy.target_identity_phrases
        else None
    )
    basketball_pattern = _terms_pattern(policy.basketball_terms)
    non_basketball_pattern = _terms_pattern(policy.non_basketball_terms)
    direct_non_basketball_pattern = _sport_name_pattern(
        policy.non_basketball_terms, player_name
    )
    basketball_document = bool(basketball_pattern.search(text))
    non_basketball_document = bool(non_basketball_pattern.search(text))
    target_document_identity = (
        basketball_document
        and _has_phrase(text, policy.target_document_identity_phrases)
    )
    target_title_document_identity = (
        basketball_document
        and _has_phrase(
            article.title,
            policy.target_title_document_identity_phrases,
        )
    )
    non_basketball_title_identity = bool(
        re.search(r"(?:국가\s*대표|대표\s*팀)", article.title)
        and non_basketball_pattern.search(article.title)
    )
    namesake_document_signal = any(
        _has_namesake_document_signal(text, namesake)
        for namesake in policy.known_namesakes
    )

    for namesake in policy.known_namesakes:
        if _has_phrase(article.title, namesake.title_identity_phrases):
            namesake_title_reasons.append(
                f"{namesake.label}: 제목의 동명이인 신분 문맥"
            )
        if namesake.event_identity_phrases and (
            _has_phrase(article.title, namesake.event_identity_phrases)
            or (
                player_name in article.title
                and _has_phrase(text, namesake.event_identity_phrases)
            )
        ):
            namesake_event_reasons.append(
                f"{namesake.label}: 동명이인 시기 이벤트 문맥"
            )

    for sentence in (part.strip() for part in SENTENCE_SPLIT.split(text) if part.strip()):
        if player_name not in sentence:
            continue
        target_team = target_team or bool(target_pattern.search(sentence))
        target_identity = target_identity or bool(
            target_identity_pattern and target_identity_pattern.search(sentence)
        )
        for namesake in policy.known_namesakes:
            namesake_reasons.extend(_namesake_reasons(sentence, player_name, namesake))
        auxiliary = policy.auxiliary
        if auxiliary.height_cm and _height_name_pattern(
            auxiliary.height_cm, player_name
        ).search(sentence):
            auxiliary_reasons.append("이름에 연결된 정책상 신장 보조 신호")
        if auxiliary.ages and _age_name_pattern(
            auxiliary.ages, player_name
        ).search(sentence):
            auxiliary_reasons.append("이름에 연결된 정책상 나이 보조 신호")
        if auxiliary.jersey_numbers and _jersey_name_pattern(
            auxiliary.jersey_numbers, player_name
        ).search(sentence):
            auxiliary_reasons.append("이름에 연결된 정책상 등번호 보조 신호")
        basketball = basketball or _near(sentence, player_name, basketball_pattern, 40)
        non_basketball_direct = non_basketball_direct or bool(
            direct_non_basketball_pattern.search(sentence)
        )
        non_basketball_near = non_basketball_near or _near(
            sentence, player_name, non_basketball_pattern, 40
        )

    namesake_reasons = list(_unique(namesake_reasons))
    namesake_title_reasons = list(_unique(namesake_title_reasons))
    namesake_event_reasons = list(_unique(namesake_event_reasons))
    auxiliary_reasons = list(_unique(auxiliary_reasons))
    target_reason = f"{policy.policy_id}: 이름에 직접 귀속된 목표 소속팀"
    target_identity_reason = f"{policy.policy_id}: 이름에 연결된 목표 신분 문맥"
    target_document_identity_reason = (
        f"{policy.policy_id}: 성인 여자농구 대표팀 문서 문맥과 본문 이름 연결"
    )
    title_team_context = (
        policy.allow_title_team_context
        and player_name not in article.title
        and _title_team_context(
            article.title,
            policy.target_team_aliases,
            policy.target_title_opponent_prefixes,
            policy.target_title_object_predicates,
        )
    )
    namesake_team_in_title = any(
        namesake.team_aliases
        and re.search(
            _flexible_alternatives(namesake.team_aliases),
            article.title,
            re.IGNORECASE,
        )
        for namesake in policy.known_namesakes
    )
    target_team_in_title = bool(
        re.search(
            _flexible_alternatives(policy.target_team_aliases),
            article.title,
            re.IGNORECASE,
        )
    )
    title_team_reason = f"{policy.policy_id}: 제목의 목표팀 주어 문맥과 본문 이름 연결"

    if namesake_title_reasons:
        return ClassifiedArticle(
            article,
            EntityDecision.REJECT,
            _unique([
                f"{policy.policy_id}: 제목으로 확인된 알려진 동명이인",
                *namesake_title_reasons,
                *namesake_reasons,
                *auxiliary_reasons,
            ]),
        )

    if non_basketball_title_identity:
        if basketball_document:
            return ClassifiedArticle(
                article,
                EntityDecision.AMBIGUOUS,
                (f"{policy.policy_id}: 제목의 비농구 대표팀과 농구 문맥 충돌",),
            )
        return ClassifiedArticle(
            article,
            EntityDecision.REJECT,
            (f"{policy.policy_id}: 제목으로 확인된 비농구 대표팀",),
        )

    if (target_team or target_identity) and (
        namesake_reasons
        or (target_identity and namesake_team_in_title)
        or non_basketball_direct
        or non_basketball_near
    ):
        return ClassifiedArticle(
            article,
            EntityDecision.AMBIGUOUS,
            _unique([
                f"{policy.policy_id}: 목표 선수와 동명이인 소속·종목 신호 충돌",
                *([target_reason] if target_team else []),
                *([target_identity_reason] if target_identity else []),
                *namesake_reasons,
                *(
                    [f"{policy.policy_id}: 제목에 동명이인 팀 문맥이 함께 있음"]
                    if target_identity and namesake_team_in_title
                    else []
                ),
                *(
                    [f"{policy.policy_id}: 이름에 연결된 비농구 종목"]
                    if non_basketball_direct or non_basketball_near
                    else []
                ),
                *auxiliary_reasons,
            ]),
        )
    if basketball and (non_basketball_direct or non_basketball_near):
        return ClassifiedArticle(
            article,
            EntityDecision.AMBIGUOUS,
            _unique([
                f"{policy.policy_id}: 농구와 비농구 종목 문맥 충돌",
                *auxiliary_reasons,
            ]),
        )
    if namesake_reasons:
        return ClassifiedArticle(
            article,
            EntityDecision.REJECT,
            _unique([f"{policy.policy_id}: 알려진 동명이인", *namesake_reasons, *auxiliary_reasons]),
        )
    if non_basketball_direct:
        return ClassifiedArticle(
            article,
            EntityDecision.REJECT,
            (f"{policy.policy_id}: 이름에 연결된 비농구 종목",),
        )
    if non_basketball_near:
        return ClassifiedArticle(
            article,
            EntityDecision.AMBIGUOUS,
            (f"{policy.policy_id}: 비농구 종목이 근처에 있으나 이름 귀속이 불명확",),
        )
    if auxiliary_reasons and namesake_team_in_title:
        return ClassifiedArticle(
            article,
            EntityDecision.AMBIGUOUS,
            _unique([
                f"{policy.policy_id}: 목표 보조 신호와 제목의 동명이인 팀 문맥 충돌",
                *auxiliary_reasons,
            ]),
        )
    if (
        player_name in article.title
        and target_team_in_title
        and namesake_team_in_title
        and not target_team
        and not namesake_reasons
    ):
        return ClassifiedArticle(
            article,
            EntityDecision.AMBIGUOUS,
            (f"{policy.policy_id}: 제목의 양 팀 중 선수 소속 귀속이 불명확",),
        )
    if relevance.decision is RelevanceDecision.IRRELEVANT:
        return ClassifiedArticle(
            article,
            EntityDecision.REJECT,
            (f"{policy.policy_id}: 선수 직접 관련성 없음", relevance.reason),
        )
    if target_team:
        return ClassifiedArticle(
            article,
            EntityDecision.ACCEPT,
            _unique([target_reason, *auxiliary_reasons]),
        )
    if target_identity:
        return ClassifiedArticle(
            article,
            EntityDecision.ACCEPT,
            _unique([target_identity_reason, *auxiliary_reasons]),
        )
    if auxiliary_reasons and basketball:
        return ClassifiedArticle(
            article,
            EntityDecision.ACCEPT,
            _unique([
                f"{policy.policy_id}: 농구 문맥과 직접 연결된 목표 보조 신호",
                *auxiliary_reasons,
            ]),
        )
    if namesake_event_reasons:
        return ClassifiedArticle(
            article,
            EntityDecision.REJECT,
            _unique([
                f"{policy.policy_id}: 알려진 동명이인 이벤트",
                *namesake_event_reasons,
            ]),
        )
    if player_name in article.title:
        return ClassifiedArticle(
            article,
            EntityDecision.ACCEPT,
            (f"{policy.policy_id}: 관련성 확인", relevance.reason),
        )
    if basketball_document:
        return ClassifiedArticle(
            article,
            EntityDecision.ACCEPT,
            (f"{policy.policy_id}: 강한 본문 관련성 확인", relevance.reason),
        )
    if target_document_identity and (
        namesake_team_in_title or namesake_document_signal
    ):
        return ClassifiedArticle(
            article,
            EntityDecision.AMBIGUOUS,
            _unique([
                f"{policy.policy_id}: 성인 대표팀 문맥과 동명이인 신호 충돌",
                target_document_identity_reason,
            ]),
        )
    if target_document_identity:
        return ClassifiedArticle(
            article,
            EntityDecision.ACCEPT,
            (target_document_identity_reason,),
        )
    if (
        target_title_document_identity
        and not namesake_document_signal
        and not non_basketball_document
    ):
        return ClassifiedArticle(
            article,
            EntityDecision.ACCEPT,
            (
                f"{policy.policy_id}: 제목의 성인 대표팀 문맥과 농구 본문 이름 연결",
            ),
        )
    if title_team_context and namesake_team_in_title:
        return ClassifiedArticle(
            article,
            EntityDecision.AMBIGUOUS,
            _unique([
                f"{policy.policy_id}: 제목에 목표팀과 동명이인 팀 문맥이 함께 있음",
                title_team_reason,
            ]),
        )
    if title_team_context:
        return ClassifiedArticle(
            article,
            EntityDecision.ACCEPT,
            (title_team_reason,),
        )
    if (
        policy.allow_basketball_document_fallback
        and basketball_document
        and not namesake_document_signal
        and not non_basketball_document
    ):
        return ClassifiedArticle(
            article,
            EntityDecision.ACCEPT,
            (
                f"{policy.policy_id}: 해당 기간의 안전한 농구 문서 fallback",
            ),
        )

    reasons = [*auxiliary_reasons]
    if basketball:
        reasons.append(
            f"{policy.policy_id}: 농구 문맥이지만 정책상 목표 소속팀을 확인할 수 없음"
        )
    elif "국가대표" in text:
        reasons.append(
            f"{policy.policy_id}: 국가대표 문맥이지만 종목·소속팀을 확인할 수 없음"
        )
    else:
        reasons.append(
            f"{policy.policy_id}: 이름은 일치하지만 목표 소속팀을 확인할 수 없음"
        )
    return ClassifiedArticle(article, EntityDecision.AMBIGUOUS, _unique(reasons))
