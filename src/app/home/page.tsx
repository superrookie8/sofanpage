"use client";
import Hero from "@/features/home/components/hero";
import SeasonStats from "@/features/stats/components/seasonStats";
import NextGameSection from "@/features/home/components/nextGameSection";
import LatestNewsSection, {
	MoreNewsLink,
} from "@/features/home/components/latestNewsSection";

function SectionHeading({
	title,
	action,
}: {
	title: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="mb-3 flex items-baseline justify-between gap-3">
			<h2 className="text-h2 lg:text-h2-lg">{title}</h2>
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

			<section>
				<SectionHeading title="다음 경기" />
				<NextGameSection />
			</section>

			<section>
				<SectionHeading title="최신 소식" action={<MoreNewsLink />} />
				<LatestNewsSection />
			</section>
		</div>
	);
}
