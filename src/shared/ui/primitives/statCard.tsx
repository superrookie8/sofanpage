import { cn } from "../cn";

export interface StatCardProps {
	value: string | number;
	label: string;
	/** 전 시즌 대비 증감. 없으면 표기하지 않는다. */
	delta?: number | null;
	/** 값 뒤에 붙는 작은 단위 (예: %) */
	suffix?: string;
	dark?: boolean;
	className?: string;
}

/** 시안 §04 — 숫자 28~36px/800 tabular, 라벨 11px/600 +.06em. */
export default function StatCard({
	value,
	label,
	delta,
	suffix,
	dark,
	className,
}: StatCardProps) {
	const hasDelta = typeof delta === "number";
	const rising = hasDelta && delta > 0;
	const flat = hasDelta && delta === 0;

	return (
		<div
			className={cn(
				"rounded-md border px-3.5 py-4",
				dark ? "bg-surface-dark border-ink-700" : "bg-white border-ink-200",
				className
			)}
		>
			<div
				data-numeric
				className={cn(
					"text-stat lg:text-stat-lg",
					dark ? "text-white" : "text-ink-900"
				)}
			>
				{value}
				{suffix && <span className="text-[16px]">{suffix}</span>}
			</div>
			<div className="text-stat-label mt-1.5 text-ink-500">{label}</div>
			{hasDelta && (
				<div
					data-numeric
					className={cn(
						"mt-1 text-[12px] font-semibold",
						flat ? "text-ink-300" : rising ? "text-win" : "text-ink-500"
					)}
				>
					{flat ? "—" : rising ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
				</div>
			)}
		</div>
	);
}
