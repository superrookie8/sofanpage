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
	venueLabel?: string;
	competition?: string;
	onClick?: () => void;
	className?: string;
}

/** 날짜와 매치업 아래에 경기 장소를 표시하고 홈·원정·중립은 보조 정보로 둔다. */
export default function GameCard({
	dateLabel,
	weekdayLabel,
	countdownLabel,
	opponent,
	detail,
	isHome,
	venueLabel,
	competition,
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
				{competition && <p className="mb-1 text-xs text-ink-500">{competition}</p>}
				<div className="truncate text-[16px] font-bold text-ink-900">
					{opponent}
				</div>
				<div className="mt-1 text-[13px] font-medium text-ink-700">{detail}</div>
				<span className="mt-1 block text-[11px] text-ink-400">
					{venueLabel || (isHome ? "홈" : "원정")}
				</span>
			</div>
		</Tag>
	);
}
