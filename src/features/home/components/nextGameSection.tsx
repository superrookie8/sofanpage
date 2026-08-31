"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useSchedulesByDateRangeQuery } from "@/features/games/queries";
import { findNextGame, matchupLabel } from "@/features/games/nextGame";
import GameCard from "@/shared/ui/primitives/gameCard";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { EmptyState } from "@/shared/ui/primitives/states";
import {
	formatCountdown,
	formatMonthDay,
	formatTime,
	formatWeekday,
} from "@/shared/lib/datetime";

function isoDate(date: Date) {
	return date.toISOString().slice(0, 10);
}

/** 홈의 "다음 경기" 블록. 클릭하면 /schedule로 이동한다. */
export default function NextGameSection() {
	const router = useRouter();

	const { start, end } = useMemo(() => {
		const now = new Date();
		const later = new Date(now);
		later.setMonth(later.getMonth() + 3);
		return { start: isoDate(now), end: isoDate(later) };
	}, []);

	const { data, isLoading } = useSchedulesByDateRangeQuery(start, end);
	const nextGame = useMemo(() => findNextGame(data ?? []), [data]);

	if (isLoading) {
		return <Skeleton className="h-[86px] rounded-md" />;
	}

	if (!nextGame) {
		return (
			<EmptyState
				title="예정된 경기가 없어요"
				description="다음 일정이 공개되면 여기에 표시됩니다"
			/>
		);
	}

	return (
		<GameCard
			dateLabel={formatMonthDay(nextGame.startDateTime)}
			weekdayLabel={formatWeekday(nextGame.startDateTime)}
			countdownLabel={formatCountdown(nextGame.startDateTime)}
			opponent={matchupLabel(nextGame)}
			detail={[formatTime(nextGame.startDateTime), nextGame.location]
				.filter(Boolean)
				.join(" · ")}
			isHome={nextGame.isHome !== false}
			onClick={() => router.push("/schedule")}
		/>
	);
}
