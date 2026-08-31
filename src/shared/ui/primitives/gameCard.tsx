import Chip from "./chip";
import { cn } from "../cn";

export interface GameCardProps {
	/** "10.14" */
	dateLabel: string;
	/** "화" */
	weekdayLabel: string;
	/** "D-7". 지난 경기면 생략 */
	countdownLabel?: string | null;
	opponent: string;
	/** "19:00 · 부산 사직실내체육관" */
	detail: string;
	isHome: boolean;
	onClick?: () => void;
	className?: string;
}

/** 시안 §04 — 날짜 블록 | 세로 구분선 | 매치업 | 홈·원정 뱃지 */
export default function GameCard({
	dateLabel,
	weekdayLabel,
	countdownLabel,
	opponent,
	detail,
	isHome,
	onClick,
	className,
}: GameCardProps) {
	const Tag = onClick ? "button" : "div";

	return (
		<Tag
			type={onClick ? "button" : undefined}
			onClick={onClick}
			className={cn(
				"flex w-full items-center gap-3.5 rounded-md border border-ink-200 bg-white p-4 text-left",
				onClick &&
					"transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-raised motion-reduce:hover:translate-y-0",
				className
			)}
		>
			<div className="w-[52px] flex-shrink-0 text-center">
				{countdownLabel && (
					<div className="text-[11px] font-semibold text-brand-700">
						{countdownLabel}
					</div>
				)}
				<div data-numeric className="text-[22px] font-extrabold leading-tight text-ink-900">
					{dateLabel}
				</div>
				<div className="text-[11px] text-ink-500">{weekdayLabel}</div>
			</div>
			<div className="w-px self-stretch bg-ink-100" />
			<div className="min-w-0 flex-1">
				<div className="truncate text-[16px] font-bold text-ink-900">
					{opponent}
				</div>
				<div className="mt-0.5 truncate text-[13px] text-ink-500">{detail}</div>
			</div>
			<Chip tone={isHome ? "home" : "away"} className="h-[26px] flex-shrink-0 px-2.5 text-[12px]">
				{isHome ? "홈" : "원정"}
			</Chip>
		</Tag>
	);
}
