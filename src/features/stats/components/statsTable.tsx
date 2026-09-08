import type { SeasonStats, StatsTableRow } from "../types";
import { AVERAGE_KEYS, TOTAL_KEYS } from "../types";
import { buildCareerStats } from "../career";

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
	const career = buildCareerStats(stats);
	const rows: StatsTableRow[] = career ? [...stats, career] : stats;

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
					{rows.map((stat) => {
						const isCareer = stat.season === "통산";
						return (
							<tr
								key={stat.season}
								className={
									isCareer
										? "border-t-2 border-brand-200 bg-brand-50"
										: "border-t border-ink-100"
								}
							>
								<th
									scope="row"
									className={
										isCareer
											? "sticky left-0 z-10 bg-brand-50 px-3 py-2.5 text-left font-extrabold text-brand-700"
											: "sticky left-0 z-10 bg-white px-3 py-2.5 text-left font-bold text-ink-900"
									}
								>
									{stat.season}
								</th>
								{keys.map((key) => (
									<td
										key={key}
										className={
											isCareer
												? "whitespace-nowrap px-3 py-2.5 text-center font-bold text-ink-900"
												: "whitespace-nowrap px-3 py-2.5 text-center text-ink-700"
										}
									>
										{String(
											(
												stat[mode] as unknown as Record<
													string,
													string | number | null
												>
											)[key] ?? "-"
										)}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
