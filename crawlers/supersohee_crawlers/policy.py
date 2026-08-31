from dataclasses import dataclass
from datetime import date, datetime
import json
from functools import lru_cache
from pathlib import Path


DEFAULT_POLICY_PATH = (
    Path(__file__).resolve().parents[1] / "config" / "player_identity_policies.json"
)


class PolicyConfigError(ValueError):
    pass


@dataclass(frozen=True)
class DraftPick:
    year: int
    overall: int


@dataclass(frozen=True)
class KnownNamesake:
    label: str
    team_aliases: tuple[str, ...]
    school_aliases: tuple[str, ...]
    identity_phrases: tuple[str, ...]
    title_identity_phrases: tuple[str, ...]
    event_identity_phrases: tuple[str, ...]
    height_cm: tuple[int, ...]
    draft_picks: tuple[DraftPick, ...]


@dataclass(frozen=True)
class AuxiliarySignals:
    height_cm: tuple[int, ...]
    ages: tuple[int, ...]
    jersey_numbers: tuple[int, ...]


@dataclass(frozen=True)
class RelevancePolicy:
    indirect_title_phrases: tuple[str, ...]
    irrelevant_title_phrases: tuple[str, ...]
    body_selection_phrases: tuple[str, ...]
    body_quote_verbs: tuple[str, ...]
    body_record_units: tuple[str, ...]
    body_record_qualifiers: tuple[str, ...]


@dataclass(frozen=True)
class IdentityPolicy:
    policy_id: str
    season: str
    effective_from: date
    effective_to: date
    target_team_aliases: tuple[str, ...]
    target_identity_phrases: tuple[str, ...]
    target_document_identity_phrases: tuple[str, ...]
    target_title_document_identity_phrases: tuple[str, ...]
    allow_basketball_document_fallback: bool
    allow_title_team_context: bool
    target_title_opponent_prefixes: tuple[str, ...]
    target_title_object_predicates: tuple[str, ...]
    known_namesakes: tuple[KnownNamesake, ...]
    auxiliary: AuxiliarySignals
    basketball_terms: tuple[str, ...]
    non_basketball_terms: tuple[str, ...]


@dataclass(frozen=True)
class IdentityPolicyStore:
    player_name: str
    relevance: RelevancePolicy
    policies: tuple[IdentityPolicy, ...]

    def policy_for(self, published_at: str) -> IdentityPolicy | None:
        try:
            article_date = datetime.fromisoformat(published_at).date()
        except (TypeError, ValueError) as error:
            raise PolicyConfigError(f"invalid article publishedAt: {published_at!r}") from error
        matches = [
            policy
            for policy in self.policies
            if policy.effective_from <= article_date <= policy.effective_to
        ]
        if len(matches) > 1:
            raise PolicyConfigError(
                f"multiple identity policies cover article date {article_date.isoformat()}"
            )
        return matches[0] if matches else None


def _mapping(value, field: str) -> dict:
    if not isinstance(value, dict):
        raise PolicyConfigError(f"{field} must be an object")
    return value


def _list(value, field: str) -> list:
    if not isinstance(value, list):
        raise PolicyConfigError(f"{field} must be an array")
    return value


def _strings(value, field: str, *, required: bool = False) -> tuple[str, ...]:
    values = _list(value, field)
    if any(not isinstance(item, str) or not item.strip() for item in values):
        raise PolicyConfigError(f"{field} must contain non-empty strings")
    normalized = tuple(dict.fromkeys(item.strip() for item in values))
    if required and not normalized:
        raise PolicyConfigError(f"{field} must not be empty")
    return normalized


def _integers(value, field: str) -> tuple[int, ...]:
    values = _list(value, field)
    if any(isinstance(item, bool) or not isinstance(item, int) or item < 0 for item in values):
        raise PolicyConfigError(f"{field} must contain non-negative integers")
    return tuple(dict.fromkeys(values))


def _required_string(value, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise PolicyConfigError(f"{field} must be a non-empty string")
    return value.strip()


def _boolean(value, field: str, *, default: bool = False) -> bool:
    if value is None:
        return default
    if not isinstance(value, bool):
        raise PolicyConfigError(f"{field} must be a boolean")
    return value


def _date(value, field: str) -> date:
    text = _required_string(value, field)
    try:
        parsed = date.fromisoformat(text)
    except ValueError as error:
        raise PolicyConfigError(f"{field} must use YYYY-MM-DD") from error
    if parsed.isoformat() != text:
        raise PolicyConfigError(f"{field} must use YYYY-MM-DD")
    return parsed


def _namesake(value, field: str) -> KnownNamesake:
    item = _mapping(value, field)
    picks = []
    for index, raw_pick in enumerate(_list(item.get("draftPicks", []), f"{field}.draftPicks")):
        pick = _mapping(raw_pick, f"{field}.draftPicks[{index}]")
        year = pick.get("year")
        overall = pick.get("overall")
        if (
            isinstance(year, bool)
            or not isinstance(year, int)
            or year < 1900
            or isinstance(overall, bool)
            or not isinstance(overall, int)
            or overall < 1
        ):
            raise PolicyConfigError(
                f"{field}.draftPicks[{index}] requires integer year and positive overall"
            )
        picks.append(DraftPick(year, overall))
    namesake = KnownNamesake(
        label=_required_string(item.get("label"), f"{field}.label"),
        team_aliases=_strings(item.get("teamAliases", []), f"{field}.teamAliases"),
        school_aliases=_strings(item.get("schoolAliases", []), f"{field}.schoolAliases"),
        identity_phrases=_strings(
            item.get("identityPhrases", []), f"{field}.identityPhrases"
        ),
        title_identity_phrases=_strings(
            item.get("titleIdentityPhrases", []),
            f"{field}.titleIdentityPhrases",
        ),
        event_identity_phrases=_strings(
            item.get("eventIdentityPhrases", []),
            f"{field}.eventIdentityPhrases",
        ),
        height_cm=_integers(item.get("heightCm", []), f"{field}.heightCm"),
        draft_picks=tuple(picks),
    )
    if not (
        namesake.team_aliases
        or namesake.school_aliases
        or namesake.identity_phrases
        or namesake.title_identity_phrases
        or namesake.event_identity_phrases
        or namesake.height_cm
        or namesake.draft_picks
    ):
        raise PolicyConfigError(f"{field} must define at least one identity signal")
    return namesake


def _policy(value, index: int) -> IdentityPolicy:
    field = f"policies[{index}]"
    item = _mapping(value, field)
    effective_from = _date(item.get("effectiveFrom"), f"{field}.effectiveFrom")
    effective_to = _date(item.get("effectiveTo"), f"{field}.effectiveTo")
    if effective_from > effective_to:
        raise PolicyConfigError(f"{field}.effectiveFrom must be on or before effectiveTo")
    target = _mapping(item.get("target"), f"{field}.target")
    auxiliary = _mapping(item.get("auxiliarySignals", {}), f"{field}.auxiliarySignals")
    policy = IdentityPolicy(
        policy_id=_required_string(item.get("id"), f"{field}.id"),
        season=_required_string(item.get("season"), f"{field}.season"),
        effective_from=effective_from,
        effective_to=effective_to,
        target_team_aliases=_strings(
            target.get("teamAliases"), f"{field}.target.teamAliases", required=True
        ),
        target_identity_phrases=_strings(
            target.get("identityPhrases", []),
            f"{field}.target.identityPhrases",
        ),
        target_document_identity_phrases=_strings(
            target.get("documentIdentityPhrases", []),
            f"{field}.target.documentIdentityPhrases",
        ),
        target_title_document_identity_phrases=_strings(
            target.get("titleDocumentIdentityPhrases", []),
            f"{field}.target.titleDocumentIdentityPhrases",
        ),
        allow_basketball_document_fallback=_boolean(
            item.get("allowBasketballDocumentFallback"),
            f"{field}.allowBasketballDocumentFallback",
        ),
        allow_title_team_context=_boolean(
            target.get("allowTitleTeamContext"),
            f"{field}.target.allowTitleTeamContext",
        ),
        target_title_opponent_prefixes=_strings(
            target.get("titleOpponentPrefixes", []),
            f"{field}.target.titleOpponentPrefixes",
        ),
        target_title_object_predicates=_strings(
            target.get("titleObjectPredicates", []),
            f"{field}.target.titleObjectPredicates",
        ),
        known_namesakes=tuple(
            _namesake(raw, f"{field}.knownNamesakes[{namesake_index}]")
            for namesake_index, raw in enumerate(
                _list(item.get("knownNamesakes", []), f"{field}.knownNamesakes")
            )
        ),
        auxiliary=AuxiliarySignals(
            height_cm=_integers(
                auxiliary.get("heightCm", []), f"{field}.auxiliarySignals.heightCm"
            ),
            ages=_integers(auxiliary.get("ages", []), f"{field}.auxiliarySignals.ages"),
            jersey_numbers=_integers(
                auxiliary.get("jerseyNumbers", []),
                f"{field}.auxiliarySignals.jerseyNumbers",
            ),
        ),
        basketball_terms=_strings(
            item.get("basketballTerms"), f"{field}.basketballTerms", required=True
        ),
        non_basketball_terms=_strings(
            item.get("nonBasketballTerms"),
            f"{field}.nonBasketballTerms",
            required=True,
        ),
    )
    if policy.allow_title_team_context and not policy.target_title_object_predicates:
        raise PolicyConfigError(
            f"{field}.target.titleObjectPredicates must not be empty when "
            "allowTitleTeamContext is true"
        )
    if not policy.allow_title_team_context and (
        policy.target_title_opponent_prefixes
        or policy.target_title_object_predicates
    ):
        raise PolicyConfigError(
            f"{field}.target title context guards require allowTitleTeamContext=true"
        )
    return policy


def load_policy_store(path: str | Path) -> IdentityPolicyStore:
    policy_path = Path(path).expanduser()
    try:
        raw = json.loads(policy_path.read_text(encoding="utf-8"))
    except OSError as error:
        raise PolicyConfigError(f"cannot read identity policy: {policy_path}") from error
    except json.JSONDecodeError as error:
        raise PolicyConfigError(f"identity policy is not valid JSON: {policy_path}") from error
    root = _mapping(raw, "root")
    if root.get("version") != 1:
        raise PolicyConfigError("identity policy version must be 1")
    policies = tuple(
        sorted(
            (
                _policy(value, index)
                for index, value in enumerate(_list(root.get("policies"), "policies"))
            ),
            key=lambda policy: policy.effective_from,
        )
    )
    if not policies:
        raise PolicyConfigError("policies must not be empty")
    ids = [policy.policy_id for policy in policies]
    if len(ids) != len(set(ids)):
        raise PolicyConfigError("identity policy ids must be unique")
    for previous, current in zip(policies, policies[1:]):
        if current.effective_from <= previous.effective_to:
            raise PolicyConfigError(
                "identity policy periods overlap: "
                f"{previous.policy_id} and {current.policy_id}"
            )
    relevance = _mapping(root.get("relevance", {}), "relevance")
    return IdentityPolicyStore(
        player_name=_required_string(root.get("playerName"), "playerName"),
        relevance=RelevancePolicy(
            indirect_title_phrases=_strings(
                relevance.get("indirectTitlePhrases", []),
                "relevance.indirectTitlePhrases",
            ),
            irrelevant_title_phrases=_strings(
                relevance.get("irrelevantTitlePhrases", []),
                "relevance.irrelevantTitlePhrases",
            ),
            body_selection_phrases=_strings(
                relevance.get("bodySelectionPhrases", []),
                "relevance.bodySelectionPhrases",
            ),
            body_quote_verbs=_strings(
                relevance.get("bodyQuoteVerbs", []),
                "relevance.bodyQuoteVerbs",
            ),
            body_record_units=_strings(
                relevance.get("bodyRecordUnits", []),
                "relevance.bodyRecordUnits",
            ),
            body_record_qualifiers=_strings(
                relevance.get("bodyRecordQualifiers", []),
                "relevance.bodyRecordQualifiers",
            ),
        ),
        policies=policies,
    )


@lru_cache(maxsize=1)
def load_default_policy_store() -> IdentityPolicyStore:
    return load_policy_store(DEFAULT_POLICY_PATH)
