import { cn } from "../cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	/** 다크 셸(이벤트·아케이드)용 서피스 */
	dark?: boolean;
	/** 호버 시 살짝 떠오르는 인터랙티브 카드 */
	interactive?: boolean;
}

/**
 * 불투명 서피스. 리디자인의 핵심 규칙 — 반투명 오버레이(bg-opacity-75)를
 * 쓰지 않는다. 그림자보다 1px 보더를 우선한다.
 */
export default function Card({
	dark,
	interactive,
	className,
	...props
}: CardProps) {
	return (
		<div
			className={cn(
				"rounded-md border",
				dark
					? "bg-surface-dark border-ink-700 text-white"
					: "bg-white border-ink-200",
				interactive &&
					"transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-raised motion-reduce:hover:translate-y-0",
				className
			)}
			{...props}
		/>
	);
}
