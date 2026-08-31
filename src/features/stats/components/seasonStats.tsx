"use client";
import { useMemo, useState } from "react";
import SegmentedTabs from "@/shared/ui/primitives/segmentedTabs";
import StatCard from "@/shared/ui/primitives/statCard";
import Button from "@/shared/ui/primitives/button";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { ErrorState } from "@/shared/ui/primitives/states";
import { useSeasonStatsQuery } from "../queries";
import { buildHighlights, sortSeasonsDesc } from "../highlights";
import StatsTable from "./statsTable";

/**
 * 홈의 "시즌 기록" 블록.
 * 핵심 4지표를 StatCard로 먼저 보여주고, 전체 표는 접어 둔다(disclosure).
 */
export default function SeasonStats() {
	const { data, isLoading, isError, refetch } = useSeasonStatsQuery();
	const [expanded, setExpanded] = useState(false);
	const [mode, setMode] = useState<"average" | "total">("average");

	const summary = useMemo(() => buildHighlights(data ?? []), [data]);
	const sorted = useMemo(() => sortSeasonsDesc(data ?? []), [data]);

	if (isLoading) {
		return (
			<div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
				{Array.from({ length: 4 }, (_, index) => (
					<Skeleton key={index} className="h-[104px] rounded-md" />
				))}
			</div>
		);
	}

	if (isError || !summary) {
		return <ErrorState onRetry={() => refetch()} />;
	}

	return (
		<div>
			<div className="mb-3 flex items-baseline justify-between gap-3">
				<h2 className="text-h2 lg:text-h2-lg">{summary.season} 시즌</h2>
			</div>

			<div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
				{summary.highlights.map((highlight) => (
					<StatCard
						key={highlight.label}
						value={highlight.value}
						suffix={highlight.suffix}
						label={highlight.label}
						delta={highlight.delta}
					/>
				))}
			</div>

			<div className="mt-3">
				<Button
					variant="secondary"
					fullWidth
					aria-expanded={expanded}
					onClick={() => setExpanded((open) => !open)}
				>
					전체 기록 {expanded ? "접기 ▴" : "보기 ▾"}
				</Button>
			</div>

			{expanded && (
				<div className="mt-4">
					<SegmentedTabs
						aria-label="기록 종류"
						value={mode}
						onChange={setMode}
						options={[
							{ value: "average", label: "Average" },
							{ value: "total", label: "Total" },
						]}
						className="mb-3"
					/>
					<StatsTable stats={sorted} mode={mode} />
				</div>
			)}
		</div>
	);
}
