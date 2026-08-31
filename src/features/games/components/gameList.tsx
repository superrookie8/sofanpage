"use client";
import { useMemo } from "react";
import type { ScheduleResponse } from "../types";
import { isGameSchedule } from "../nextGame";
import { isHomeGame, matchupLabel, venueName } from "../scheduleView";
import GameCard from "@/shared/ui/primitives/gameCard";
import { EmptyState } from "@/shared/ui/primitives/states";
import {
	formatCountdown,
	formatMonthDay,
	formatTime,
	formatWeekday,
	parseDate,
} from "@/shared/lib/datetime";

/** 월 구분선이 있는 경기 목록. 모바일 기본 뷰. */
export default function GameList({
	schedules,
	onSelect,
}: {
	schedules: ScheduleResponse[];
	onSelect: (scheduleId: string) => void;
}) {
	const grouped = useMemo(() => {
		const games = schedules
			.filter(isGameSchedule)
			.map((schedule) => ({ schedule, date: parseDate(schedule.startDateTime) }))
			.filter(
				(entry): entry is { schedule: ScheduleResponse; date: Date } =>
					entry.date !== null
			)
			.sort((a, b) => a.date.getTime() - b.date.getTime());

		const buckets = new Map<string, ScheduleResponse[]>();
		for (const { schedule, date } of games) {
			const key = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
			const bucket = buckets.get(key);
			if (bucket) bucket.push(schedule);
			else buckets.set(key, [schedule]);
		}
		return Array.from(buckets.entries());
	}, [schedules]);

	if (grouped.length === 0) {
		return <EmptyState illustration="black" title="표시할 경기가 없어요" />;
	}

	return (
		<div className="flex flex-col gap-6">
			{grouped.map(([month, games]) => (
				<div key={month}>
					<h3 className="mb-2.5 text-[12px] font-bold text-ink-500">{month}</h3>
					<div className="flex flex-col gap-2">
						{games.map((game) => (
							<GameCard
								key={game.id}
								dateLabel={formatMonthDay(game.startDateTime)}
								weekdayLabel={formatWeekday(game.startDateTime)}
								countdownLabel={formatCountdown(game.startDateTime)}
								opponent={matchupLabel(game)}
								detail={[formatTime(game.startDateTime), venueName(game)]
									.filter(Boolean)
									.join(" · ")}
								isHome={isHomeGame(game)}
								onClick={() => onSelect(game.id)}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
