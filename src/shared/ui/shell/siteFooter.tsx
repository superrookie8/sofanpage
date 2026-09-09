import Link from "next/link";
import { cn } from "../cn";

export default function SiteFooter({ dark = false }: { dark?: boolean }) {
	return (
		<footer
			className={cn(
				"mt-12 border-t px-5 pb-5 pt-5 lg:mt-16 lg:px-7 lg:pb-7 lg:pt-7",
				dark ? "border-ink-700" : "border-ink-200"
			)}
		>
			<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
				<div className="max-w-2xl">
					<p
						className={cn(
							"font-display text-[20px] tracking-[.02em]",
							dark ? "text-white" : "text-ink-900"
						)}
					>
						SUPER SOHEE
					</p>
					<p
						className={cn(
							"mt-3 text-sm font-bold lg:text-sm-lg",
							dark ? "text-white" : "text-ink-900"
						)}
					>
						농구선수 이소희 팬페이지
					</p>
					<p
						className={cn(
							"mt-1.5 text-sm",
							dark ? "text-ink-300" : "text-ink-700"
						)}
					>
						이소희 선수를 응원하며 선수 소식, 관련기사, 경기 일정과 팬이벤트를 나눕니다.
					</p>
				</div>

				<div
					className={cn(
						"flex items-center gap-2 text-sm",
						dark ? "text-ink-300" : "text-ink-700"
					)}
				>
					<span>제작자 : </span>
					<a
						href="https://www.instagram.com/hahanana20C/"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="제작자 소셜 계정"
						className={cn(
							"inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
							dark
								? "border-ink-700 bg-transparent text-ink-300 hover:border-ink-500 hover:bg-white/10 hover:text-white"
								: "border-ink-200 bg-white text-ink-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
						)}
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							className="h-5 w-5"
						>
							<rect
								x="3"
								y="3"
								width="18"
								height="18"
								rx="5"
								stroke="currentColor"
								strokeWidth="1.8"
							/>
							<circle
								cx="12"
								cy="12"
								r="4"
								stroke="currentColor"
								strokeWidth="1.8"
							/>
							<circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
						</svg>
					</a>
				</div>
			</div>

			<div
				className={cn(
					"mt-7 border-t pt-5 text-caption",
					dark ? "border-ink-700 text-ink-300" : "border-ink-100 text-ink-500"
				)}
			>
				<nav aria-label="정책" className="mb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
					<Link className="font-semibold underline-offset-4 hover:underline" href="/privacy">개인정보처리방침</Link>
					<Link className="font-semibold underline-offset-4 hover:underline" href="/terms">이용약관</Link>
				</nav>
				<p>사이트에 사용된 사진, 기사 등 외부 콘텐츠의 권리는 각 원저작자에게 있습니다.</p>
				<p className="mt-1">© 2024–2026 SUPER SOHEE</p>
			</div>
		</footer>
	);
}
