import { cn } from "../cn";

export interface PageHeaderProps {
	title: string;
	description?: string;
	/** 우측 액션 슬롯 */
	action?: React.ReactNode;
	dark?: boolean;
	/** Anton 아이브로우 (예: "FAN EVENTS") */
	eyebrow?: string;
	className?: string;
}

/** 페이지마다 제각각이던 레드 바를 대체하는 공통 헤더. */
export default function PageHeader({
	title,
	description,
	action,
	dark,
	eyebrow,
	className,
}: PageHeaderProps) {
	return (
		<div
			className={cn(
				"flex items-end justify-between gap-4 pb-5 lg:pb-6",
				className
			)}
		>
			<div className="min-w-0">
				{eyebrow && (
					<div className="font-display text-[13px] tracking-[.12em] text-brand-400">
						{eyebrow}
					</div>
				)}
				<h1
					className={cn(
						"text-h1 lg:text-h1-lg mt-1",
						dark ? "text-white" : "text-ink-900"
					)}
				>
					{title}
				</h1>
				{description && (
					<p
						className={cn(
							"text-sm-lg mt-1.5",
							dark ? "text-ink-300" : "text-ink-500"
						)}
					>
						{description}
					</p>
				)}
			</div>
			{action && <div className="flex-shrink-0">{action}</div>}
		</div>
	);
}
