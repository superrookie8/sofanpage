import json
from datetime import datetime
from pathlib import Path

from .pipeline import IncrementalSourceResult


REVIEW_ROOT = Path("/private/tmp")


def review_path(value: str | None, now: datetime | None = None) -> Path:
    timestamp = (now or datetime.now()).strftime("%Y%m%d-%H%M%S-%f")
    path = Path(value) if value else REVIEW_ROOT / f"supersohee-crawler-review-{timestamp}.json"
    if not path.is_absolute() or REVIEW_ROOT not in path.resolve().parents:
        raise ValueError("review output must be an absolute JSON path under /private/tmp")
    if path.suffix.lower() != ".json":
        raise ValueError("review output must use a .json extension")
    return path


def write_review(results: list[IncrementalSourceResult], path: Path) -> None:
    payload = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "submitted": False,
        "sources": [result.as_review_dict() for result in results],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("x", encoding="utf-8") as output:
        json.dump(payload, output, ensure_ascii=False, indent=2)
        output.write("\n")
