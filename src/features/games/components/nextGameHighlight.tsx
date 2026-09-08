"use client";
import { competitionLabel, venueTypeLabel } from "../competition";
import type { ScheduleResponse } from "../types";
import { isHomeGame, matchupLabel, venueName } from "../scheduleView";
import Button from "@/shared/ui/primitives/button";
import {
	formatCountdown,
	formatTime,
	formatWeekday,
	parseDate,
} from "@/shared/lib/datetime";

/** 시안 §3 — ink-900 배경 + Anton 등번호 장식의 NEXT GAME 카드. */
export default function NextGameHighlight({
	game,
	onOpenDetail,
}: {
	game: ScheduleResponse;
	onOpenDetail: () => void;
}) {
	const date = parseDate(game.startDateTime);
	const countdown = formatCountdown(game.startDateTime);
	const isHome = isHomeGame(game);

	return (
		<section className="relative overflow-hidden rounded-lg bg-ink-900 p-6 lg:p-8">
			<span
				aria-hidden
				className="pointer-events-none absolute -top-2 right-4 font-display text-[100px] leading-none text-brand-500/35 lg:text-[110px]"
			>
				6
			</span>

			<p className="text-[12px] font-bold tracking-[.08em] text-brand-400">
				NEXT GAME{countdown ? ` · ${countdown}` : ""}
			</p>
			<p className="mt-2 text-sm text-ink-300">{competitionLabel(game)}</p>
			<h2 className="mt-2 text-[22px] font-extrabold text-white lg:text-[24px]">
				{matchupLabel(game)}
			</h2>
			<p className="mt-1.5 text-sm-lg text-ink-300">
				{date
					? `${date.getMonth() + 1}월 ${date.getDate()}일 (${formatWeekday(
							game.startDateTime
					  )}) ${formatTime(game.startDateTime)}`
					: ""}
				 · 한국시간{venueName(game) ? ` · ${venueName(game)}` : " · 경기장 미정"}
			</p>

			<div className="mt-4 flex items-center gap-3">
				<span
					className={`inline-flex h-7 items-center rounded-full px-3 text-[12px] font-bold ${
						venueTypeLabel(game) === "중립" ? "bg-amber-50 text-amber-800" : isHome ? "bg-brand-50 text-brand-700" : "bg-white/[.16] text-white"
					}`}
				>
					{venueTypeLabel(game)}
				</span>
				<Button size="sm" onClick={onOpenDetail}>
					경기 정보
				</Button>
			</div>
		</section>
	);
}
