import Hero from "@/features/home/components/hero";
import SeasonStats from "@/features/stats/components/seasonStats";
import NextGameSection from "@/features/home/components/nextGameSection";
import LatestNewsSection, {
	MoreNewsLink,
} from "@/features/home/components/latestNewsSection";
import InternationalResultsSection from "@/features/international-results/components/internationalResultsSection";

function SectionHeading({
	title,
	action,
	id,
}: {
	title: string;
	action?: React.ReactNode;
	id?: string;
}) {
	return (
		<div className="mb-3 flex items-baseline justify-between gap-3">
			<h2 id={id} className="text-h2 lg:text-h2-lg">{title}</h2>
			{action}
		</div>
	);
}

export default function HomePage() {
	return (
		<div className="flex flex-col gap-10 lg:gap-14">
			<Hero />

			<section aria-labelledby="season-stats">
				<h2 id="season-stats" className="sr-only">
					시즌 기록
				</h2>
				<SeasonStats />
			</section>

			<section aria-labelledby="international-results">
				<SectionHeading id="international-results" title="국가대표·국제대회" />
				<p className="mb-4 text-sm text-ink-500">
					대한민국 대표팀과 소속팀에서 치른 국제무대 기록입니다.
				</p>
				<div>
					<InternationalResultsSection />
				</div>
			</section>

			<section>
				<SectionHeading title="다음 경기" />
				<NextGameSection />
			</section>

			<section>
				<SectionHeading title="최신 소식" action={<MoreNewsLink />} />
				<LatestNewsSection />
			</section>

			<section
				aria-labelledby="fanpage-title"
				className="border-t border-ink-100 pt-6 lg:pt-8"
			>
				<h1 id="fanpage-title" className="text-h2 lg:text-h2-lg">
					농구선수 이소희 팬페이지 슈퍼소희(SUPER SOHEE)
				</h1>
				<p className="mt-2 text-sm text-ink-700">
					이소희 선수를 응원하며 선수 소식, 관련 기사, 경기 일정과 팬 이벤트를 함께 나눕니다.
				</p>
			</section>
		</div>
	);
}
