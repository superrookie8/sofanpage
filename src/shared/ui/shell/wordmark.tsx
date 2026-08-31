import Link from "next/link";
import { cn } from "../cn";

/** 레드 SS 사각 로고 + Anton 워드마크. 어느 페이지에서도 정체성을 유지한다. */
export default function Wordmark({
	dark,
	compact,
}: {
	dark?: boolean;
	compact?: boolean;
}) {
	return (
		<Link href="/home" className="flex items-center gap-2.5" aria-label="SUPER SOHEE 홈">
			<span
				className={cn(
					"flex items-center justify-center rounded-[8px] bg-brand-500 font-display text-white",
					compact ? "h-7 w-7 text-[12px]" : "h-8 w-8 text-[14px]"
				)}
			>
				SS
			</span>
			<span
				className={cn(
					"font-display tracking-[.02em]",
					compact ? "text-[16px]" : "text-[18px]",
					dark ? "text-white" : "text-ink-900"
				)}
			>
				SUPER SOHEE
			</span>
		</Link>
	);
}
