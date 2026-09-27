"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CardSkeletonList } from "@/shared/ui/primitives/skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/primitives/states";
import { newsPageNumbers, parseNewsPage } from "@/features/news/pagination";
import { fetchVideoPage } from "../api";
import { parseVideoFilter, videoPageHref } from "../links";
import { VIDEO_CATEGORIES, type VideoSort } from "../types";
import styles from "./videosPage.module.css";

export default function VideosPage() {
	const params = useSearchParams();
	const router = useRouter();
	const category = parseVideoFilter(params.get("category"));
	const sort: VideoSort = params.get("sort") === "focused" ? "focused" : "recent";
	const page = parseNewsPage(params.get("page"));
	const query = useQuery({ queryKey: ["videos", category, sort, page], queryFn: () => fetchVideoPage(category, sort, page) });
	const last = Math.max(1, query.data?.totalPages ?? 0);
	useEffect(() => {
		if (query.isSuccess && page > last) router.replace(videoPageHref(category, sort, last));
	}, [query.isSuccess, page, last, category, sort, router]);
	return <div className={styles.page}>
		<div className={styles.intro}>
			<div><p className={styles.eyebrow}>SOHEE ON COURT</p><h1>영상으로 다시 만나는 순간</h1><p>대한민국 여자농구의 경기와 이야기를 모았습니다.</p></div>
			<div className={styles.collection}><i aria-hidden="true" />2026 아이치·나고야 아시안게임</div>
		</div>
		<div className={styles.toolbar}>
			<div className={styles.filters} role="group" aria-label="영상 분류">
				<Link href={videoPageHref("all", sort)} aria-current={category === "all" ? "true" : undefined}>전체</Link>
				{Object.entries(VIDEO_CATEGORIES).map(([key, label]) => <Link key={key} href={videoPageHref(parseVideoFilter(key), sort)} aria-current={category === key ? "true" : undefined}>{label}</Link>)}
			</div>
			<div className={styles.sortTools}>
				{query.data && !query.isError && <span role="status">총 <strong>{query.data.total}</strong>개 영상</span>}
				<label className="sr-only" htmlFor="video-sort">영상 정렬</label>
				<select id="video-sort" value={sort} aria-describedby="video-sort-note" onChange={(e) => router.push(videoPageHref(category, e.target.value as VideoSort))}>
					<option value="recent">경기·행사 최신순</option><option value="focused">이소희 중심 먼저</option>
				</select>
			</div>
		</div>
		<p id="video-sort-note" className="sr-only">영상 게시일이 아닌 경기·행사 날짜 기준입니다. 같은 날짜는 경기 하이라이트, 인터뷰·뉴스, 현장·시상식, 쇼츠 순입니다.</p>
		{query.isError ? <ErrorState onRetry={() => { void query.refetch(); }} /> : query.isLoading ? <CardSkeletonList count={6} /> : !query.data?.videos.length ?
			<EmptyState illustration="white" title="등록된 영상이 없어요" description="다른 분류를 선택해보세요" /> : <>
			<div className={styles.grid}>{query.data.videos.map((video) => <a className={styles.card} key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" aria-label={`${video.title} (YouTube 새 창)`}>
				<div className={styles.thumb}>
					{/* External thumbnails retain the original YouTube image without an image proxy. */}
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={video.thumbnailUrl} alt="" loading="lazy" width={480} height={270} />
					<span className={styles.play} aria-hidden="true">▶</span>
					{(video.duration || video.category === "shorts") && <span className={styles.duration}>{video.duration || "Shorts"}</span>}
				</div>
				<div className={styles.body}><div className={styles.tags}><span>{VIDEO_CATEGORIES[video.category]}</span><span>{video.eventLabel}</span></div>
					<h2>{video.title}</h2><div className={styles.channel}>{video.badge && <span className={styles.avatar}>{video.badge}</span>}{video.channelName}<span className={styles.external} aria-hidden="true">↗</span></div>
				</div>
			</a>)}</div>
		</>}
		{!query.isLoading && !query.isError && <nav className={styles.pagination} aria-label="영상 페이지">
			{page > 1 ? <Link href={videoPageHref(category, sort, page - 1)} rel="prev">이전</Link> : <span aria-disabled="true">이전</span>}
			{newsPageNumbers(Math.min(page, last), query.data?.totalPages ?? 0).map((number, index) => number === "gap" ? <span key={`gap-${index}`} aria-hidden="true">…</span> : <Link key={number} href={videoPageHref(category, sort, number)} aria-label={`${number}페이지`} aria-current={number === page ? "page" : undefined}>{number}</Link>)}
			{page < last ? <Link href={videoPageHref(category, sort, page + 1)} rel="next">다음</Link> : <span aria-disabled="true">다음</span>}
		</nav>}
		<p className={styles.note}>영상은 원본 채널의 YouTube 페이지에서 새 창으로 열립니다.</p>
	</div>;
}
