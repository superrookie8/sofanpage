"use client";
import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "../cn";

export interface SegmentedTabsProps<T extends string> {
	options: ReadonlyArray<{ value: T; label: string }>;
	value: T;
	onChange: (value: T) => void;
	className?: string;
	"aria-label"?: string;
}

/** 시안 §03 — 컨테이너 ink-100 라운드 12 패딩 4, 활성 세그먼트는 흰 배경 + soft. */
export default function SegmentedTabs<T extends string>({
	options,
	value,
	onChange,
	className,
	"aria-label": ariaLabel,
}: SegmentedTabsProps<T>) {
	const layoutId = useId();

	return (
		<div
			role="tablist"
			aria-label={ariaLabel}
			className={cn(
				"inline-flex gap-1 rounded-md bg-ink-100 p-1",
				className
			)}
		>
			{options.map((option) => {
				const active = option.value === value;
				return (
					<button
						key={option.value}
						role="tab"
						type="button"
						aria-selected={active}
						onClick={() => onChange(option.value)}
						className={cn(
							"relative h-9 rounded-[9px] px-5 text-[14px] transition-colors",
							active ? "text-ink-900 font-bold" : "text-ink-500 font-medium"
						)}
					>
						{active && (
							<motion.span
								layoutId={layoutId}
								transition={{ type: "spring", duration: 0.28 }}
								className="absolute inset-0 rounded-[9px] bg-white shadow-soft"
							/>
						)}
						<span className="relative z-10">{option.label}</span>
					</button>
				);
			})}
		</div>
	);
}
