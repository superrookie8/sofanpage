import { cn } from "../cn";

type ChipTone =
	| "default"
	| "selected"
	| "dark"
	| "inverse"
	| "win"
	| "lose"
	| "home"
	| "away";

const TONE: Record<ChipTone, string> = {
	default: "border border-ink-200 bg-white text-ink-700 font-medium",
	selected: "border border-brand-500 bg-brand-500 text-white font-bold",
	// 다크 셸 위 기본 칩
	dark: "border border-ink-700 bg-surface-dark text-ink-300 font-medium",
	// 밝은 배경 위 반전 칩 (등번호 등)
	inverse: "border border-ink-900 bg-ink-900 text-white font-bold",
	win: "bg-win/[.12] text-win font-bold",
	lose: "bg-ink-100 text-ink-500 font-semibold",
	home: "bg-brand-50 text-brand-700 font-semibold",
	away: "bg-ink-100 text-ink-700 font-semibold",
};

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
	tone?: ChipTone;
	/** 필터 등 누를 수 있는 칩이면 button으로 렌더한다. */
	as?: "span" | "button";
	onSelect?: () => void;
}

/** 시안 §03 — 높이 32px pill. 승/패는 색만이 아니라 텍스트 라벨도 함께 쓴다. */
export default function Chip({
	tone = "default",
	as = "span",
	onSelect,
	className,
	children,
	...props
}: ChipProps) {
	const classes = cn(
		"h-8 inline-flex items-center gap-1.5 px-3.5 rounded-full text-[13px] whitespace-nowrap transition-colors",
		TONE[tone],
		className
	);

	if (as === "button") {
		return (
			<button type="button" onClick={onSelect} className={classes}>
				{children}
			</button>
		);
	}
	return (
		<span className={classes} {...props}>
			{children}
		</span>
	);
}
