"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/shared/ui/primitives/pageHeader";
import NewsCard from "@/shared/ui/primitives/newsCard";
import { CardSkeletonList } from "@/shared/ui/primitives/skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/primitives/states";
import { track } from "@/lib/analytics/events";
import { formatRelativeTime } from "@/shared/lib/datetime";
import FeatureCard from "./featureCard";
import { useNewsPageQuery } from "../queries";
import { newsPageHref, newsPageNumbers, newsPageStatus, parseNewsPage, parseNewsSource, type NewsSource } from "../pagination";

const SOURCES: Array<{ value: NewsSource; label: string }> = [
	{ value: "all", label: "전체" }, { value: "jumpball", label: "점프볼" },
	{ value: "rookie", label: "루키" }, { value: "other", label: "그외" },
];
const pageClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold";

export default function NewsPage() {
	const search = useSearchParams();
	const router = useRouter();
	const source = parseNewsSource(search.get("source"));
	const page = parseNewsPage(search.get("page"));
	const query = useNewsPageQuery(source, page, 8);
	const totalPages = query.data?.totalPages ?? 0;
	const lastPage = Math.max(1, totalPages);
	useEffect(() => {
		if (query.isSuccess && page > lastPage) router.replace(newsPageHref(source, lastPage));
	}, [query.isSuccess, page, lastPage, router, source]);
	const articles = query.data?.articles ?? [];
	const featured = source === "all" && page === 1 ? articles[0] : undefined;
	const stream = featured ? articles.slice(1) : articles;
	return <div>
		<PageHeader title="뉴스" description="이소희 선수 관련 기사를 모았습니다" />
		<div className="mb-5 flex gap-2" role="group" aria-label="출처 필터">
			{SOURCES.map((option) => <Link key={option.value} href={newsPageHref(option.value, 1)}
				aria-current={source === option.value ? "true" : undefined}
				className={`rounded-full border px-4 py-2 text-sm font-semibold ${source === option.value ? "border-brand-500 bg-brand-500 text-white" : "border-ink-200 bg-white text-ink-700"}`}
				onClick={() => track("news_source_filter", { source: option.value })}>{option.label}</Link>)}
		</div>
		{query.isError ? <ErrorState onRetry={() => { void query.refetch(); }} /> : query.isLoading ? <CardSkeletonList count={5} /> : <>
			{featured && <div className="mb-6"><FeatureCard article={featured} /></div>}
			{articles.length === 0 ? <EmptyState illustration="white" title="기사가 없어요" description="다른 출처를 선택해보세요" /> : <div className="grid gap-2.5 lg:grid-cols-2">
				{stream.map((article) => <NewsCard key={article.id} href={article.url} title={article.title}
					source={article.source || "뉴스"} timeLabel={formatRelativeTime(article.publishedAt)} imageUrl={article.imageUrl}
					onOpen={() => track("news_article_open", { source: article.source || "뉴스", surface: "news_page" })} />)}
			</div>}
			<div className="mt-6 flex flex-col items-center gap-3">
				<p className="text-sm font-semibold tabular-nums text-ink-500" role="status" aria-live="polite">{newsPageStatus(Math.min(page, lastPage), lastPage)}</p>
				<nav aria-label="뉴스 페이지" className="flex flex-wrap items-center justify-center gap-1.5">
					{page > 1 ? <Link className={pageClass} href={newsPageHref(source, page - 1)} rel="prev">이전</Link> : <span className={`${pageClass} opacity-40`} aria-disabled="true">이전</span>}
					{newsPageNumbers(Math.min(page, lastPage), totalPages).map((number, index) => number === "gap" ? <span key={`gap-${index}`} aria-hidden="true">…</span> :
						<Link key={number} href={newsPageHref(source, number)} aria-label={`${number}페이지`} aria-current={page === number ? "page" : undefined}
							className={`${pageClass} ${page === number ? "border-brand-500 bg-brand-500 text-white" : "bg-white"}`}>{number}</Link>)}
					{page < totalPages ? <Link className={pageClass} href={newsPageHref(source, page + 1)} rel="next">다음</Link> : <span className={`${pageClass} opacity-40`} aria-disabled="true">다음</span>}
				</nav>
			</div>
		</>}
	</div>;
}
