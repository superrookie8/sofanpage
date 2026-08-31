import argparse
from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path

from .classify import EntityDecision, classify_entity
from .models import NormalizedArticle
from .policy import IdentityPolicyStore, load_default_policy_store


AUDIT_ROOT = Path("/private/tmp")


class CleanupAuditError(ValueError):
    pass


def _private_json_path(value: str, label: str) -> Path:
    path = Path(value)
    if (
        not path.is_absolute()
        or AUDIT_ROOT not in path.resolve().parents
        or path.suffix.lower() != ".json"
    ):
        raise CleanupAuditError(
            f"{label} must be an absolute JSON path under /private/tmp"
        )
    return path


def _string(document: dict, field: str, index: int, *, nonempty: bool = True) -> str:
    value = document.get(field)
    if not isinstance(value, str) or (nonempty and not value.strip()):
        requirement = "a non-empty string" if nonempty else "a string"
        raise CleanupAuditError(f"documents[{index}].{field} must be {requirement}")
    return value.strip() if nonempty else value


def _ejson_value(value, key: str):
    if isinstance(value, dict) and set(value) == {key}:
        return value[key]
    return value


def _document_id(document: dict, index: int) -> str:
    value = _ejson_value(document.get("id", document.get("_id")), "$oid")
    if not isinstance(value, str) or not value.strip():
        raise CleanupAuditError(f"documents[{index}] requires id or _id.$oid")
    return value.strip()


def _published_at(document: dict, index: int) -> str:
    value = _ejson_value(document.get("publishedAt"), "$date")
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        value = datetime.fromtimestamp(value / 1000, tz=timezone.utc).isoformat()
    if not isinstance(value, str) or not value.strip():
        raise CleanupAuditError(
            f"documents[{index}].publishedAt requires an ISO string or $date"
        )
    normalized = value.strip().replace("Z", "+00:00")
    try:
        datetime.fromisoformat(normalized)
    except ValueError as error:
        raise CleanupAuditError(
            f"documents[{index}].publishedAt is not a valid ISO datetime"
        ) from error
    return normalized


def build_cleanup_audit(
    payload: dict,
    policy_store: IdentityPolicyStore | None = None,
) -> dict:
    if not isinstance(payload, dict) or not isinstance(payload.get("documents"), list):
        raise CleanupAuditError("input must be an object with a documents array")
    policies = policy_store or load_default_policy_store()
    rows = []
    for index, document in enumerate(payload["documents"]):
        if not isinstance(document, dict):
            raise CleanupAuditError(f"documents[{index}] must be an object")
        summary = _string(document, "summary", index)
        source = _string(document, "source", index).lower()
        title = _string(document, "title", index)
        url = _string(document, "url", index)
        published_at = _published_at(document, index)
        classified = classify_entity(
            NormalizedArticle(
                source=source,
                title=title,
                url=url,
                summary=summary,
                image_url=(
                    document.get("imageUrl")
                    if isinstance(document.get("imageUrl"), str)
                    else None
                ),
                published_at=published_at,
            ),
            policies,
        )
        action = {
            EntityDecision.ACCEPT: "KEEP",
            EntityDecision.REJECT: "DELETE_CANDIDATE",
            EntityDecision.AMBIGUOUS: "MANUAL_REVIEW",
        }[classified.decision]
        rows.append(
            {
                "id": _document_id(document, index),
                "source": source,
                "title": title,
                "url": url,
                "publishedAt": published_at,
                "decision": classified.decision.value,
                "action": action,
                "reasons": list(classified.reasons),
            }
        )
    counts = Counter(row["action"] for row in rows)
    return {
        "kind": "supersohee-cleanup-audit-v1",
        "generatedAt": datetime.now(tz=timezone.utc).isoformat(timespec="seconds"),
        "inputDocumentCount": len(rows),
        "summaryRequired": True,
        "mutationPerformed": False,
        "counts": {
            "keep": counts["KEEP"],
            "deleteCandidate": counts["DELETE_CANDIDATE"],
            "manualReview": counts["MANUAL_REVIEW"],
        },
        "documents": rows,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Classify a full-summary EJSON backup into a read-only cleanup audit."
    )
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args(argv)
    input_path = _private_json_path(args.input, "input")
    output_path = _private_json_path(args.output, "output")
    try:
        payload = json.loads(input_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise CleanupAuditError(f"cannot read cleanup input: {input_path}") from error
    audit = build_cleanup_audit(payload)
    try:
        with output_path.open("x", encoding="utf-8") as output:
            json.dump(audit, output, ensure_ascii=False, indent=2)
            output.write("\n")
    except OSError as error:
        raise CleanupAuditError(f"cannot create cleanup audit: {output_path}") from error
    print(
        f"cleanup_audit={output_path} documents={audit['inputDocumentCount']} "
        f"keep={audit['counts']['keep']} "
        f"delete_candidate={audit['counts']['deleteCandidate']} "
        f"manual_review={audit['counts']['manualReview']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
