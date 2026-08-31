"use client";
import Link from "next/link";
import { useJumpballNewsQuery, useLatestNewsQuery } from "@/features/news/queries";
import NewsCard from "@/shared/ui/primitives/newsCard";
import { CardSkeletonList } from "@/shared/ui/primitives/skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/primitives/states";
import { formatRelativeTime } from "@/shared/lib/datetime";
import type { Article } from "@/features/news/types";

/** 홈의 "최신 소식" — 뉴스 3건 요약 + 더보기. */
export default function LatestNewsSection() {
	const {
		data: latest,
		isLoading: latestLoading,
		isError: latestError,
		refetch: refetchLatest,
	} = useLatestNewsQuery();
	const {
		data: jumpball,
		isLoading: jumpballLoading,
		isError: jumpballError,
		refetch: refetchJumpball,
	} = useJumpballNewsQuery(1, 3);

	const isLoading = latestLoading || jumpballLoading;
	const isError = latestError && jumpballError;

	const articles: Article[] = [];
	if (latest?.main_article) articles.push(latest.main_article);
	for (const article of jumpball?.articles ?? []) {
		if (articles.length >= 3) break;
		if (articles.some((existing) => existing.id === article.id)) continue;
		articles.push(article);
	}

	if (isLoading) {
		return <CardSkeletonList count={3} />;
	}

	if (isError) {
		return (
			<ErrorState
				onRetry={() => {
					refetchLatest();
					refetchJumpball();
				}}
			/>
		);
	}

	if (articles.length === 0) {
		return <EmptyState title="표시할 기사가 없어요" />;
	}

	return (
		<div className="grid gap-2.5 lg:grid-cols-3">
			{articles.slice(0, 3).map((article) => (
				<NewsCard
					key={article.id}
					href={article.url}
					title={article.title}
					source={article.source || "뉴스"}
					timeLabel={formatRelativeTime(article.publishedAt)}
					imageUrl={article.imageUrl}
					orientation="horizontal"
					className="lg:[&>div]:flex-col"
				/>
			))}
		</div>
	);
}

export function MoreNewsLink() {
	return (
		<Link
			href="/news"
			className="inline-flex h-8 items-center rounded-sm px-2 text-[14px] font-semibold text-brand-700 hover:bg-brand-50"
		>
			더보기 →
		</Link>
	);
}
