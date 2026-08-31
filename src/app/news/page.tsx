"use client";
import { useMemo, useState } from "react";
import PageHeader from "@/shared/ui/primitives/pageHeader";
import Chip from "@/shared/ui/primitives/chip";
import Button from "@/shared/ui/primitives/button";
import NewsCard from "@/shared/ui/primitives/newsCard";
import { CardSkeletonList } from "@/shared/ui/primitives/skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/primitives/states";
import FeatureCard from "@/features/news/components/featureCard";
import {
	useJumpballNewsQuery,
	useLatestNewsQuery,
	useRookieNewsQuery,
} from "@/features/news/queries";
import type { Article } from "@/features/news/types";
import { formatRelativeTime, parseDate } from "@/shared/lib/datetime";

type Source = "all" | "jumpball" | "rookie";

const SOURCES: ReadonlyArray<{ value: Source; label: string }> = [
	{ value: "all", label: "전체" },
	{ value: "jumpball", label: "점프볼" },
	{ value: "rookie", label: "루키" },
];

const PAGE_SIZE = 8;

export default function NewsPage() {
	const [source, setSource] = useState<Source>("all");
	const [page, setPage] = useState(1);

	const { data: latest, isLoading: latestLoading } = useLatestNewsQuery();

	// "전체"에서는 두 매체를 모두 받아 발행일 기준으로 합친다.
	const wantJumpball = source === "all" || source === "jumpball";
	const wantRookie = source === "all" || source === "rookie";

	const jumpball = useJumpballNewsQuery(page, wantJumpball ? PAGE_SIZE : 1);
	const rookie = useRookieNewsQuery(page, wantRookie ? PAGE_SIZE : 1);

	const isLoading = jumpball.isLoading || rookie.isLoading;
	const isError = jumpball.isError && rookie.isError;

	const featured = latest?.main_article;

	const stream = useMemo(() => {
		const collected: Article[] = [];
		if (wantJumpball) collected.push(...(jumpball.data?.articles ?? []));
		if (wantRookie) collected.push(...(rookie.data?.articles ?? []));

		const seen = new Set<string>();
		if (featured) seen.add(featured.id);

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
	}, [wantJumpball, wantRookie, jumpball.data, rookie.data, featured]);

	const hasMore =
		(wantJumpball && jumpball.data?.hasNext) ||
		(wantRookie && rookie.data?.hasNext);

	const changeSource = (next: Source) => {
		setSource(next);
		setPage(1);
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

			{isError ? (
				<ErrorState
					onRetry={() => {
						jumpball.refetch();
						rookie.refetch();
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
							/>
						))}
					</div>

					{hasMore && (
						<div className="mt-6 flex justify-center">
							<Button
								variant="secondary"
								onClick={() => setPage((current) => current + 1)}
							>
								더 보기
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
