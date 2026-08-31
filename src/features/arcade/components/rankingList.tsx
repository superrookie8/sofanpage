"use client";
import { useArcadeRankingQuery } from "../queries";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { EmptyState, ErrorState } from "@/shared/ui/primitives/states";
import { cn } from "@/shared/ui/cn";

const MEDAL = ["bg-medal-gold", "bg-medal-silver", "bg-medal-bronze"];

/** TOP 10. 1~3위는 메달 뱃지, 내 순위는 하단 sticky 행. */
export default function RankingList() {
	const { data, isLoading, isError, refetch } = useArcadeRankingQuery(10);

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				{Array.from({ length: 5 }, (_, index) => (
					<Skeleton key={index} className="h-12 rounded-md" />
				))}
			</div>
		);
	}

	if (isError) {
		return <ErrorState dark onRetry={() => refetch()} />;
	}

	if (!data || data.length === 0) {
		return (
			<EmptyState
				dark
				title="아직 기록이 없어요"
				description="첫 번째 랭커가 되어보세요"
			/>
		);
	}

	const myEntry = data.find((entry) => entry.isMe);

	return (
		<div className="relative">
			<ol className="flex flex-col gap-1.5">
				{data.map((entry) => {
					const medal = entry.rank <= 3 ? MEDAL[entry.rank - 1] : null;
					return (
						<li
							key={`${entry.rank}-${entry.nickname}`}
							className={cn(
								"flex items-center gap-3 rounded-md border border-ink-700 bg-surface-dark px-3 py-2.5",
								entry.isMe && "border-brand-500"
							)}
						>
							{medal ? (
								<span
									data-numeric
									className={cn(
										"flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold text-ink-900",
										medal
									)}
								>
									{entry.rank}
								</span>
							) : (
								<span
									data-numeric
									className="flex h-7 w-7 flex-shrink-0 items-center justify-center text-[13px] font-semibold text-ink-300"
								>
									{entry.rank}
								</span>
							)}
							<span className="min-w-0 flex-1 truncate text-[15px] font-medium text-white">
								{entry.nickname}
							</span>
							<span
								data-numeric
								className="text-[15px] font-extrabold text-white"
							>
								{entry.score.toLocaleString()}
							</span>
						</li>
					);
				})}
			</ol>

			{myEntry && (
				<div className="sticky bottom-0 mt-2 flex items-center gap-3 rounded-md border-t border-brand-500 bg-[rgba(225,29,51,.14)] px-3 py-2.5 backdrop-blur">
					<span data-numeric className="w-7 flex-shrink-0 text-center text-[13px] font-bold text-brand-400">
						{myEntry.rank}
					</span>
					<span className="min-w-0 flex-1 truncate text-[15px] font-bold text-white">
						{myEntry.nickname} (나)
					</span>
					<span data-numeric className="text-[15px] font-extrabold text-white">
						{myEntry.score.toLocaleString()}
					</span>
				</div>
			)}
		</div>
	);
}
