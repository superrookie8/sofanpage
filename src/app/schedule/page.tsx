"use client";
import { Suspense, useMemo, useState } from "react";
import PageHeader from "@/shared/ui/primitives/pageHeader";
import SegmentedTabs from "@/shared/ui/primitives/segmentedTabs";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { ErrorState } from "@/shared/ui/primitives/states";
import Calendar from "@/features/games/components/calender";
import GameInfoModal from "@/features/games/components/gameInfoModal";
import GameList from "@/features/games/components/gameList";
import NextGameHighlight from "@/features/games/components/nextGameHighlight";
import { useSchedulesByDateRangeQuery } from "@/features/games/queries";
import { findNextGame } from "@/features/games/nextGame";

type ViewMode = "list" | "calendar";

function isoDate(date: Date) {
	return date.toISOString().slice(0, 10);
}

export default function SchedulePage() {
	const [view, setView] = useState<ViewMode>("list");
	const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
		null
	);

	// 시즌 전체가 보이도록 과거 6개월 ~ 미래 8개월 범위를 받는다.
	const { start, end } = useMemo(() => {
		const now = new Date();
		const from = new Date(now);
		from.setMonth(from.getMonth() - 6);
		const to = new Date(now);
		to.setMonth(to.getMonth() + 8);
		return { start: isoDate(from), end: isoDate(to) };
	}, []);

	const { data, isLoading, isError, refetch } = useSchedulesByDateRangeQuery(
		start,
		end
	);

	const nextGame = useMemo(() => findNextGame(data ?? []), [data]);

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
						onOpenDetail={() => setSelectedScheduleId(nextGame.id)}
					/>
				)
			)}

			<div className="mt-8 mb-4">
				<SegmentedTabs
					aria-label="일정 보기 방식"
					value={view}
					onChange={setView}
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
					schedules={data ?? []}
					onSelect={(scheduleId) => setSelectedScheduleId(scheduleId)}
				/>
			) : (
				<div className="rounded-md border border-ink-200 bg-white p-2 lg:p-4">
					<Suspense
						fallback={
							<div className="flex h-[600px] items-center justify-center text-ink-500">
								달력을 불러오는 중…
							</div>
						}
					>
						<Calendar
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
