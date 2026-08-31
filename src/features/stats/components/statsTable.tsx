import type { AverageStats, SeasonStats, TotalStats } from "../types";
import { AVERAGE_KEYS, TOTAL_KEYS } from "../types";

/**
 * 전체 시즌 기록 표.
 * 첫 열(Season)을 sticky로 두고 가로 스크롤은 컨테이너가 담당한다.
 * 스크린 리더를 위해 caption과 scope를 명시한다.
 */
export default function StatsTable({
	stats,
	mode,
}: {
	stats: SeasonStats[];
	mode: "average" | "total";
}) {
	const keys = (mode === "average" ? AVERAGE_KEYS : TOTAL_KEYS) as string[];

	return (
		<div
			tabIndex={0}
			role="region"
			aria-label={mode === "average" ? "평균 기록 표" : "누적 기록 표"}
			className="overflow-x-auto rounded-md border border-ink-200 bg-white"
		>
			<table className="min-w-full border-collapse text-[13px]">
				<caption className="sr-only">
					{mode === "average" ? "시즌별 평균 기록" : "시즌별 누적 기록"}
				</caption>
				<thead>
					<tr className="bg-ink-50">
						<th
							scope="col"
							className="sticky left-0 z-10 bg-ink-50 px-3 py-2.5 text-left text-stat-label text-ink-500"
						>
							SEASON
						</th>
						{keys.map((key) => (
							<th
								key={key}
								scope="col"
								className="whitespace-nowrap px-3 py-2.5 text-center text-stat-label text-ink-500"
							>
								{key}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{stats.map((stat) => (
						<tr key={stat.season} className="border-t border-ink-100">
							<th
								scope="row"
								className="sticky left-0 z-10 bg-white px-3 py-2.5 text-left font-bold text-ink-900"
							>
								{stat.season}
							</th>
							{keys.map((key) => (
								<td
									key={key}
									className="whitespace-nowrap px-3 py-2.5 text-center text-ink-700"
								>
									{String(
										(stat[mode] as unknown as Record<string, string | number>)[
											key
										] ?? "-"
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
