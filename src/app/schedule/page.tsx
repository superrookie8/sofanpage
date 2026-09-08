"use client";
import ScheduleFilterControls from "@/features/games/components/scheduleFilters";
import { matchesScheduleFilters, scheduleFilterKey, type ScheduleFilters } from "@/features/games/competition";
import { Suspense, useMemo, useState } from "react";
import PageHeader from "@/shared/ui/primitives/pageHeader";
import SegmentedTabs from "@/shared/ui/primitives/segmentedTabs";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { ErrorState } from "@/shared/ui/primitives/states";
import Calendar from "@/features/games/components/calender";
import GameInfoModal from "@/features/games/components/gameInfoModal";
import GameList from "@/features/games/components/gameList";
import NextGameHighlight from "@/features/games/components/nextGameHighlight";
import { useAllSchedulesQuery } from "@/features/games/queries";
import { findNextGame } from "@/features/games/nextGame";
import { track } from "@/lib/analytics/events";


type ViewMode = "list" | "calendar";

export default function SchedulePage() {
	const [view, setView] = useState<ViewMode>("calendar");
	const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
		null
	);
	const [filters, setFilters] = useState<ScheduleFilters>({});

	// 예전에는 "오늘 −6개월 ~ +8개월" 창으로 받아, 비시즌에는 지난 시즌이
	// 통째로 창 밖으로 밀려나 지난 경기를 볼 수 없었다. 전체를 받아 시즌으로 나눈다.
	const options = useAllSchedulesQuery();
	const { data, isLoading, isError, refetch } = useAllSchedulesQuery(filters);
	const schedules = useMemo(() => data ?? [], [data]);

	const seasonSchedules = useMemo(() => schedules.filter((schedule) => matchesScheduleFilters(schedule, filters)), [schedules, filters]);
	const nextGame = useMemo(() => findNextGame(seasonSchedules), [seasonSchedules]);
	const seasonFirstMonth = useMemo(() => {
		const candidate = nextGame ?? [...seasonSchedules].sort((a, b) => b.startDateTime.localeCompare(a.startDateTime))[0];
		if (!candidate) return undefined;
		const date = new Date(candidate.startDateTime);
		return Number.isNaN(date.getTime()) ? undefined : new Date(date.getFullYear(), date.getMonth(), 1);
	}, [seasonSchedules, nextGame]);

	return (
		<div>
			<PageHeader title="경기 스케줄" description="이소희 선수의 구단·국가대표 경기 일정 · 한국시간" />

			{isLoading ? (
				<Skeleton className="h-[180px] rounded-lg" />
			) : isError ? (
				<ErrorState onRetry={() => refetch()} />
			) : (
				nextGame && (
					<NextGameHighlight
						game={nextGame}
						onOpenDetail={() => {
							setSelectedScheduleId(nextGame.id);
							track("game_detail_open", {
								game_id: nextGame.id,
								entry_point: "next_game",
							});
						}}
					/>
				)
			)}

			<div className="mt-8"><ScheduleFilterControls schedules={options.data ?? []} value={filters} onChange={setFilters} /></div>

			<div className="mt-8 mb-4">
				<SegmentedTabs
					aria-label="일정 보기 방식"
					value={view}
					onChange={(next) => {
						setView(next);
						track("schedule_view_change", { view: next });
					}}
					options={[
						{ value: "list", label: "목록" },
						{ value: "calendar", label: "달력" },
					]}
				/>
			</div>

			{isLoading ? (
				<div className="flex flex-col gap-2">
					{Array.from({ length: 4 }, (_, index) => (
						<Skeleton key={index} className="h-[86px] rounded-md" />
					))}
				</div>
			) : isError ? null : view === "list" ? (
				<GameList
					schedules={seasonSchedules}
					onSelect={(scheduleId) => {
						setSelectedScheduleId(scheduleId);
						track("game_detail_open", {
							game_id: scheduleId,
							entry_point: "list",
						});
					}}
				/>
			) : (
				<div>
					<Suspense
						fallback={
							<div className="flex h-[600px] items-center justify-center text-ink-500">
								달력을 불러오는 중…
							</div>
						}
					>
						<Calendar
							key={scheduleFilterKey(filters)}
							filters={filters}
							initialMonth={seasonFirstMonth ?? undefined}
							onLocationSelect={() => {}}
							onGameClick={(scheduleId) => setSelectedScheduleId(scheduleId)}
						/>
					</Suspense>
				</div>
			)}

			<GameInfoModal
				scheduleId={selectedScheduleId}
				isOpen={selectedScheduleId !== null}
				onClose={() => setSelectedScheduleId(null)}
			/>
		</div>
	);
}
