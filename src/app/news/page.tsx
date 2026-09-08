"use client";
import { useMemo, useState } from "react";
import PageHeader from "@/shared/ui/primitives/pageHeader";
import Chip from "@/shared/ui/primitives/chip";
import Button from "@/shared/ui/primitives/button";
import NewsCard from "@/shared/ui/primitives/newsCard";
import { track } from "@/lib/analytics/events";
import { CardSkeletonList } from "@/shared/ui/primitives/skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/primitives/states";
import FeatureCard from "@/features/news/components/featureCard";
import {
	useJumpballNewsQuery,
	useLatestNewsQuery,
	useRookieNewsQuery,
	useOtherNewsQuery,
} from "@/features/news/queries";
import type { Article } from "@/features/news/types";
import {
	newsPageStatus,
	resolveNewsTotalPages,
	type NewsSource,
} from "@/features/news/pagination";
import { formatRelativeTime, parseDate } from "@/shared/lib/datetime";

const SOURCES: ReadonlyArray<{ value: NewsSource; label: string }> = [
	{ value: "all", label: "전체" },
	{ value: "jumpball", label: "점프볼" },
	{ value: "rookie", label: "루키" },
	{ value: "other", label: "그외" },
];

const PAGE_SIZE = 8;

export default function NewsPage() {
	const [source, setSource] = useState<NewsSource>("all");
	const [page, setPage] = useState(1);

	const { data: latest, isLoading: latestLoading } = useLatestNewsQuery();

	// "전체"에서는 각 출처를 모두 받아 발행일 기준으로 합친다.
	const wantJumpball = source === "all" || source === "jumpball";
	const wantRookie = source === "all" || source === "rookie";

	const wantOther = source === "all" || source === "other";
	const jumpball = useJumpballNewsQuery(page, PAGE_SIZE, wantJumpball);
	const rookie = useRookieNewsQuery(page, PAGE_SIZE, wantRookie);
	const other = useOtherNewsQuery(page, PAGE_SIZE, wantOther);

	const activeQueries = [wantJumpball && jumpball, wantRookie && rookie, wantOther && other].filter(Boolean) as typeof jumpball[];
	const isLoading = activeQueries.some((query) => query.isLoading);
	const isError = activeQueries.every((query) => query.isError);
	const hasPartialError = !isError && activeQueries.some((query) => query.isError);

	const featured = latest?.main_article;

	const stream = useMemo(() => {
		const collected: Article[] = [];
		if (wantJumpball) collected.push(...(jumpball.data?.articles ?? []));
		if (wantRookie) collected.push(...(rookie.data?.articles ?? []));
		if (wantOther) collected.push(...(other.data?.articles ?? []));

		const seen = new Set<string>();
		if (featured && source === "all") seen.add(featured.id);

		return collected
			.filter((article) => {
				if (seen.has(article.id)) return false;
				seen.add(article.id);
				return true;
			})
			.sort((a, b) => {
				const left = parseDate(a.publishedAt)?.getTime() ?? 0;
				const right = parseDate(b.publishedAt)?.getTime() ?? 0;
				return right - left;
			});
	}, [wantJumpball, wantRookie, wantOther, jumpball.data, rookie.data, other.data, featured, source]);

	const hasMore =
		(wantJumpball && jumpball.data?.hasNext) ||
		(wantRookie && rookie.data?.hasNext) ||
		(wantOther && other.data?.hasNext);
	const totalPages = resolveNewsTotalPages(
		source,
		jumpball.data?.totalPages,
		rookie.data?.totalPages,
		other.data?.totalPages
	);

	const changeSource = (next: NewsSource) => {
		setSource(next);
		setPage(1);
		track("news_source_filter", { source: next });
	};

	return (
		<div>
			<PageHeader
				title="뉴스"
				description="이소희 선수 관련 기사를 모았습니다"
			/>

			<div className="mb-5 flex gap-2" role="group" aria-label="출처 필터">
				{SOURCES.map((option) => (
					<Chip
						key={option.value}
						as="button"
						tone={source === option.value ? "selected" : "default"}
						onSelect={() => changeSource(option.value)}
					>
						{option.label}
					</Chip>
				))}
			</div>

			{featured && source === "all" && (
				<div className="mb-6">
					{latestLoading ? (
						<CardSkeletonList count={1} />
					) : (
						<FeatureCard article={featured} />
					)}
				</div>
			)}

			{hasPartialError && (
				<p role="status" className="mb-4 text-sm text-ink-700">일부 출처의 기사를 불러오지 못했어요. <button className="underline" onClick={() => activeQueries.filter((query) => query.isError).forEach((query) => query.refetch())}>다시 시도</button></p>
			)}
			{isError ? (
				<ErrorState
					onRetry={() => {
						activeQueries.forEach((query) => query.refetch());
					}}
				/>
			) : isLoading ? (
				<CardSkeletonList count={5} />
			) : stream.length === 0 ? (
				<EmptyState
					illustration="white"
					title="기사가 없어요"
					description="다른 출처를 선택해보세요"
				/>
			) : (
				<>
					<div className="grid gap-2.5 lg:grid-cols-2">
						{stream.map((article) => (
							<NewsCard
								key={article.id}
								href={article.url}
								title={article.title}
								source={article.source || "뉴스"}
								timeLabel={formatRelativeTime(article.publishedAt)}
								imageUrl={article.imageUrl}
								onOpen={() =>
									track("news_article_open", {
										source: article.source || "뉴스",
										surface: "news_page",
									})
								}
							/>
						))}
					</div>

					<div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
						<p
							className="text-sm font-semibold tabular-nums text-ink-500"
							role="status"
							aria-live="polite"
							aria-atomic="true"
						>
							<span className="sr-only">뉴스 목록 </span>
							{newsPageStatus(page, totalPages)}
						</p>

						{hasMore && (
							<Button
								variant="secondary"
								aria-label={`다음 뉴스 페이지 보기 (${page + 1}페이지)`}
								onClick={() => {
									const next = page + 1;
									setPage(next);
									track("news_load_more", { page: next });
								}}
							>
								더 보기
							</Button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
