import Image from "next/image";
import type { Article } from "../types";
import { formatRelativeTime } from "@/shared/lib/datetime";

/** 최신 1건을 크게 보여주는 피처 카드. 모바일 세로형 / 데스크톱 2컬럼. */
export default function FeatureCard({ article }: { article: Article }) {
	return (
		<a
			href={article.url}
			target="_blank"
			rel="noopener noreferrer"
			className="group block overflow-hidden rounded-md border border-ink-200 bg-white transition-shadow hover:shadow-raised lg:grid lg:grid-cols-[1.2fr_1fr]"
		>
			<div className="relative h-[196px] w-full bg-ink-100 lg:h-[300px]">
				{article.imageUrl ? (
					<Image
						src={article.imageUrl}
						alt=""
						fill
						sizes="(max-width: 1024px) 100vw, 640px"
						className="object-cover"
						unoptimized
					/>
				) : (
					<div className="flex h-full items-center justify-center bg-ink-900">
						<span className="font-display text-[32px] text-brand-500">SS</span>
					</div>
				)}
			</div>
			<div className="p-4 lg:flex lg:flex-col lg:justify-center lg:p-6">
				<div className="flex items-center gap-2">
					<span className="inline-flex h-5 items-center rounded-sm bg-brand-50 px-2 text-[11px] font-bold text-brand-700">
						최신
					</span>
					<span className="inline-flex h-5 items-center rounded-sm bg-ink-100 px-2 text-[11px] font-semibold text-ink-700">
						{article.source || "뉴스"}
					</span>
				</div>
				<h3 className="clamp-3 mt-2.5 text-[19px] font-bold leading-[1.35] text-ink-900 lg:text-[26px]">
					{article.title}
				</h3>
				{article.summary && (
					<p className="clamp-2 mt-2 text-sm-lg text-ink-500">
						{article.summary}
					</p>
				)}
				<p className="mt-2.5 text-caption text-ink-300">
					{formatRelativeTime(article.publishedAt)}
				</p>
			</div>
		</a>
	);
}
