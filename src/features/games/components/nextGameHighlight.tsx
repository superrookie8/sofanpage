"use client";
import type { ScheduleResponse } from "../types";
import { matchupLabel } from "../nextGame";
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
	const isHome = game.isHome !== false;

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
			<h2 className="mt-2 text-[22px] font-extrabold text-white lg:text-[24px]">
				{matchupLabel(game)}
			</h2>
			<p className="mt-1.5 text-sm-lg text-ink-300">
				{date
					? `${date.getMonth() + 1}월 ${date.getDate()}일 (${formatWeekday(
							game.startDateTime
					  )}) ${formatTime(game.startDateTime)}`
					: ""}
				{game.location ? ` · ${game.location}` : ""}
			</p>

			<div className="mt-4 flex items-center gap-3">
				<span
					className={`inline-flex h-7 items-center rounded-full px-3 text-[12px] font-bold ${
						isHome ? "bg-brand-50 text-brand-700" : "bg-white/[.16] text-white"
					}`}
				>
					{isHome ? "홈" : "원정"}
				</span>
				<Button size="sm" onClick={onOpenDetail}>
					경기 정보
				</Button>
			</div>
		</section>
	);
}
