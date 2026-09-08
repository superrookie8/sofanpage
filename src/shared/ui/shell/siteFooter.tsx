export default function SiteFooter() {
	return (
		<footer className="mt-12 rounded-md border border-ink-200 bg-white p-5 shadow-soft lg:mt-16 lg:p-7">
			<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
				<div className="max-w-2xl">
					<p className="font-display text-[20px] tracking-[.02em] text-ink-900">
						SUPER SOHEE
					</p>
					<p className="mt-3 text-sm font-bold text-ink-900 lg:text-sm-lg">
						농구선수 이소희 팬페이지
					</p>
					<p className="mt-1.5 text-sm text-ink-700">
						이소희 선수를 응원하며 선수 소식, 관련기사, 경기 일정과 팬이벤트를 나눕니다.
					</p>
				</div>

				<div className="flex items-center gap-2 text-sm text-ink-700">
					<span>제작자 : </span>
					<a
						href="https://www.instagram.com/hahanana20C/"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="제작자 소셜 계정"
						className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
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

			<div className="mt-7 border-t border-ink-100 pt-5 text-caption text-ink-500">
				<p>사이트에 사용된 사진, 기사 등 외부 콘텐츠의 권리는 각 원저작자에게 있습니다.</p>
				<p className="mt-1">© 2024–2026 SUPER SOHEE</p>
			</div>
		</footer>
	);
}
