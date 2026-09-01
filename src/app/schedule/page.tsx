"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import PageHeader from "@/shared/ui/primitives/pageHeader";
import SegmentedTabs from "@/shared/ui/primitives/segmentedTabs";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { ErrorState } from "@/shared/ui/primitives/states";
import Calendar from "@/features/games/components/calender";
import GameInfoModal from "@/features/games/components/gameInfoModal";
import GameList from "@/features/games/components/gameList";
import NextGameHighlight from "@/features/games/components/nextGameHighlight";
import Chip from "@/shared/ui/primitives/chip";
import { useAllSchedulesQuery } from "@/features/games/queries";
import { findNextGame } from "@/features/games/nextGame";
import { track } from "@/lib/analytics/events";
import {
	defaultSeason,
	firstMonthOfSeason,
	listSeasons,
	schedulesInSeason,
} from "@/features/games/season";

type ViewMode = "list" | "calendar";

export default function SchedulePage() {
	const [view, setView] = useState<ViewMode>("calendar");
	const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
		null
	);
	const [season, setSeason] = useState<string | null>(null);

	// 예전에는 "오늘 −6개월 ~ +8개월" 창으로 받아, 비시즌에는 지난 시즌이
	// 통째로 창 밖으로 밀려나 지난 경기를 볼 수 없었다. 전체를 받아 시즌으로 나눈다.
	const { data, isLoading, isError, refetch } = useAllSchedulesQuery();
	const schedules = useMemo(() => data ?? [], [data]);

	const seasons = useMemo(() => listSeasons(schedules), [schedules]);

	// 첫 로딩 뒤 한 번만 기본 시즌을 정한다. 이후 선택은 사용자가 바꾼 값을 따른다.
	useEffect(() => {
		if (season !== null || schedules.length === 0) return;
		setSeason(defaultSeason(schedules));
	}, [season, schedules]);

	const seasonSchedules = useMemo(
		() => schedulesInSeason(schedules, season),
		[schedules, season]
	);

	// 달력은 선택한 시즌의 첫 경기 달에서 시작한다.
	const seasonFirstMonth = useMemo(
		() => firstMonthOfSeason(schedules, season),
		[schedules, season]
	);

	// 다음 경기 안내는 시즌과 무관하게 전체에서 찾는다.
	const nextGame = useMemo(() => findNextGame(schedules), [schedules]);

	return (
		<div>
			<PageHeader title="경기 스케줄" description="BNK 썸 경기 일정" />

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

			{seasons.length > 1 && (
				<div className="mt-8">
					<h2 className="mb-2 text-[12px] font-bold text-ink-500">시즌</h2>
					<div className="flex flex-wrap gap-2" role="group" aria-label="시즌 선택">
						{seasons.map((value) => (
							<Chip
								key={value}
								as="button"
								tone={value === season ? "selected" : "default"}
								aria-pressed={value === season}
								onSelect={() => {
									setSeason(value);
									track("schedule_season_change", { season: value });
								}}
							>
								{value}
							</Chip>
						))}
					</div>
				</div>
			)}

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
							key={season ?? "all"}
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
