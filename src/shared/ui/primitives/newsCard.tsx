import Image from "next/image";
import { cn } from "../cn";

export interface NewsCardProps {
	href: string;
	title: string;
	source: string;
	timeLabel: string;
	imageUrl?: string | null;
	/** 데스크톱 3열 그리드용 세로형 */
	orientation?: "horizontal" | "vertical";
	/** 외부 기사로 이탈할 때. 계측용이라 링크 동작에는 관여하지 않는다. */
	onOpen?: () => void;
	className?: string;
}

function Thumbnail({
	imageUrl,
	title,
	className,
}: {
	imageUrl?: string | null;
	title: string;
	className: string;
}) {
	if (imageUrl) {
		return (
			<div className={cn("relative overflow-hidden bg-ink-100", className)}>
				<Image
					src={imageUrl}
					alt=""
					fill
					sizes="(max-width: 768px) 110px, 300px"
					className="object-cover"
					unoptimized
				/>
			</div>
		);
	}
	// 시안 §04 — 썸네일 없으면 ink-900 배경 + Anton "SS" 레드 플레이스홀더
	return (
		<div
			className={cn(
				"flex items-center justify-center bg-ink-900",
				className
			)}
			aria-hidden
		>
			<span className="font-display text-[16px] text-brand-500">SS</span>
		</div>
	);
}

export default function NewsCard({
	href,
	title,
	source,
	timeLabel,
	imageUrl,
	orientation = "horizontal",
	onOpen,
	className,
}: NewsCardProps) {
	const vertical = orientation === "vertical";

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			onClick={onOpen}
			className={cn(
				"group block overflow-hidden rounded-md border border-ink-200 bg-white p-3 transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-raised motion-reduce:hover:translate-y-0",
				className
			)}
		>
			<div className={cn(vertical ? "flex flex-col gap-3" : "flex gap-3.5")}>
				<Thumbnail
					imageUrl={imageUrl}
					title={title}
					className={cn(
						"flex-shrink-0 rounded-[8px]",
						vertical ? "h-[120px] w-full" : "h-[74px] w-[110px]"
					)}
				/>
				<div className="min-w-0">
					<span className="inline-flex h-5 items-center rounded-sm bg-ink-100 px-2 text-[11px] font-semibold text-ink-700">
						{source}
					</span>
					<p className="clamp-2 mt-1.5 text-[15px] font-semibold leading-[1.4] text-ink-900">
						{title}
					</p>
					<p className="mt-1 text-caption text-ink-300">{timeLabel}</p>
				</div>
			</div>
		</a>
	);
}
