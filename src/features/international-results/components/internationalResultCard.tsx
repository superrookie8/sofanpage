import { cn } from "@/shared/ui/cn";
import {
	CATEGORY_LABELS,
	formatCompetitionDate,
	safeSourceUrl,
	STATUS_LABELS,
} from "../presentation";
import type { InternationalResult } from "../types";

const STATUS_STYLE = {
	SCHEDULED: "bg-ink-100 text-ink-700",
	IN_PROGRESS: "bg-info/15 text-info",
	FINAL: "bg-brand-50 text-brand-700",
} as const;

function formatStat(value: number | string | null) {
	if (value === null || value === "") return "–";
	return typeof value === "number" ? value.toFixed(1) : value;
}

export default function InternationalResultCard({
	result,
}: {
	result: InternationalResult;
}) {
	const stats = [
		{ label: "G", value: result.gamesPlayed },
		{ label: "PTS", value: result.pointsPerGame },
		{ label: "REB", value: result.reboundsPerGame },
		{ label: "AST", value: result.assistsPerGame },
	];
	const sources = result.sources
		.map((source) => ({ ...source, safeUrl: safeSourceUrl(source.url) }))
		.filter((source) => source.safeUrl !== null);

	return (
		<article className="flex h-full flex-col rounded-md border border-ink-200 bg-white p-4 shadow-soft lg:p-5">
			<div className="flex flex-wrap items-center gap-2">
				<span className="rounded-full bg-ink-100 px-2.5 py-1 text-caption text-ink-700">
					{CATEGORY_LABELS[result.category]}
				</span>
				<span
					className={cn(
						"rounded-full px-2.5 py-1 text-caption font-bold",
						STATUS_STYLE[result.status]
					)}
				>
					{STATUS_LABELS[result.status]}
				</span>
				{result.participationStatus === "UNCONFIRMED" && (
					<span className="rounded-full bg-warn/15 px-2.5 py-1 text-caption font-bold text-ink-700">
						명단 확인 전
					</span>
				)}
			</div>

			<div className="mt-3">
				<p className="text-caption text-ink-500">{result.editionLabel}</p>
				<h3 className="mt-0.5 text-h3 text-ink-900 lg:text-h3-lg">
					{result.competitionName}
				</h3>
				<p className="mt-1 text-sm text-ink-500">
					{formatCompetitionDate(result.startDate, result.endDate)}
					{result.location ? ` · ${result.location}` : ""}
				</p>
				<p className="mt-1 text-sm font-semibold text-ink-700">
					{result.teamName}
				</p>
			</div>

			{(result.teamResult || result.teamRecord) && (
				<div className="mt-3 rounded-[9px] bg-ink-50 px-3 py-2.5">
					<p className="text-sm font-bold text-ink-900">
						{[result.teamResult, result.teamRecord].filter(Boolean).join(" · ")}
					</p>
				</div>
			)}

			{result.status !== "SCHEDULED" && (
				<div className="mt-4 grid grid-cols-4 divide-x divide-ink-100" aria-label="대회 평균 기록">
					{stats.map((stat) => (
						<div key={stat.label} className="px-1 text-center first:pl-0 last:pr-0">
							<p className="text-[17px] font-extrabold tabular-nums text-ink-900">
								{formatStat(stat.value)}
							</p>
							<p className="mt-1 text-stat-label text-ink-500">{stat.label}</p>
						</div>
					))}
				</div>
			)}

			{result.highlight && (
				<p className="mt-4 border-l-2 border-brand-400 pl-3 text-sm text-ink-700">
					{result.highlight}
				</p>
			)}

			{result.status === "IN_PROGRESS" && result.statsUpdatedThrough && (
				<p className="mt-3 text-caption text-ink-500">
					{formatCompetitionDate(result.statsUpdatedThrough, result.statsUpdatedThrough)} 기준
				</p>
			)}

			{sources.length > 0 && (
				<div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-4">
					{sources.map((source, index) => (
						<a
							key={`${source.safeUrl}-${index}`}
							href={source.safeUrl!}
							target="_blank"
							rel="noopener noreferrer"
							className="text-caption font-semibold text-brand-700 underline-offset-2 hover:underline"
						>
							{source.label}
							<span className="sr-only"> 새 창에서 열기</span>
						</a>
					))}
				</div>
			)}
		</article>
	);
}
