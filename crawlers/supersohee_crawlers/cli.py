import argparse
import os

from .http import BoundedHttpClient
from .import_client import SpringArticleClient, SpringImportClient
from .pipeline import build_incremental_result
from .policy import DEFAULT_POLICY_PATH, PolicyConfigError, load_policy_store
from .review import review_path, write_review
from .sources import JumpballAdapter, RookieAdapter


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Collect Supersohee articles")
    parser.add_argument("--source", choices=("jumpball", "rookie", "all"), default="all")
    parser.add_argument("--keyword", default="이소희")
    parser.add_argument("--max-pages", type=int, default=2)
    parser.add_argument("--timeout", type=float, default=10)
    parser.add_argument("--retries", type=int, default=2)
    parser.add_argument("--pace-seconds", type=float, default=1)
    parser.add_argument("--review-output")
    parser.add_argument(
        "--identity-policy",
        default=str(DEFAULT_POLICY_PATH),
        help="versioned player identity policy JSON",
    )
    parser.add_argument("--submit", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not 1 <= args.max_pages <= 10:
        raise SystemExit("--max-pages must be between 1 and 10")
    try:
        policy_store = load_policy_store(args.identity_policy)
    except PolicyConfigError as error:
        raise SystemExit(f"invalid identity policy: {error}") from error
    if args.keyword != policy_store.player_name:
        raise SystemExit("--keyword must exactly match the identity policy playerName")
    backend_url = os.environ.get("SUPERSOHEE_BACKEND_URL", "")
    import_client = None
    if args.submit:
        import_client = SpringImportClient(
            backend_url,
            os.environ.get("SUPERSOHEE_ARTICLE_IMPORT_KEY", ""),
            args.timeout,
        )
    article_client = import_client or SpringArticleClient(backend_url, args.timeout)
    adapters = {
        "jumpball": JumpballAdapter(BoundedHttpClient(
            {"jumpball.co.kr", "www.jumpball.co.kr"}, args.timeout, args.retries, args.pace_seconds
        )),
        "rookie": RookieAdapter(BoundedHttpClient(
            {"rookie.co.kr", "www.rookie.co.kr"}, args.timeout, args.retries, args.pace_seconds
        )),
    }
    selected_sources = list(adapters) if args.source == "all" else [args.source]
    results = []
    for source in selected_sources:
        watermark = article_client.latest_published_at(source)
        crawl = adapters[source].crawl(args.keyword, args.max_pages, watermark)
        results.append(
            build_incremental_result(
                source,
                crawl,
                watermark,
                args.keyword,
                policy_store,
            )
        )

    output_path = review_path(args.review_output)
    write_review(results, output_path)
    for result in results:
        print(
            f"source={result.source} watermark="
            f"{result.watermark.isoformat() if result.watermark else 'none'} "
            f"pages={result.crawl.pages_crawled}/{result.crawl.available_pages} "
            f"boundary_reached={str(result.crawl.watermark_reached).lower()} "
            f"accepted={len(result.accepted)} ambiguous={len(result.ambiguous)} "
            f"rejected={len(result.rejected)}"
        )
        for item in result.classified:
            print(
                f"review source={result.source} decision={item.decision.value} "
                f"publishedAt={item.article.published_at} title={item.article.title!r} "
                f"url={item.article.url} reason={'; '.join(item.reasons)}"
            )
    print(f"review_output={output_path}")

    if args.submit:
        unsafe = [result for result in results if not result.safe_to_submit]
        if unsafe:
            for result in unsafe:
                print(f"submit_blocked source={result.source} reasons={'; '.join(result.safety_errors)}")
            return 2
        assert import_client is not None
        for source_result in results:
            result = import_client.submit_oldest_first(source_result.accepted)
            print(
                f"source={source_result.source} processed={result['processed']} "
                f"created={result['created']} existing={result['existing']} "
                f"batches={result['batches']}"
            )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
