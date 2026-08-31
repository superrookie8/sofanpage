"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import PageHeader from "@/shared/ui/primitives/pageHeader";
import Button from "@/shared/ui/primitives/button";
import StatCard from "@/shared/ui/primitives/statCard";
import Chip from "@/shared/ui/primitives/chip";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import RankingList from "@/features/arcade/components/rankingList";
import { useMyArcadeScoreQuery } from "@/features/mypage/queries";
import { CHIBI } from "@/shared/ui/chibi";

const UnityGame = dynamic(() => import("@/components/arcade/unityGame"), {
	ssr: false,
	loading: () => (
		<div className="mx-auto w-full max-w-[340px] lg:max-w-[300px]">
			<Skeleton className="aspect-[9/16] w-full rounded-md" />
		</div>
	),
});

export default function ArcadePage() {
	const [playing, setPlaying] = useState(false);
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";
	const myScore = useMyArcadeScoreQuery(isAuthenticated);

	return (
		<div>
			<PageHeader
				dark
				eyebrow="ARCADE"
				title="달려라 슈퍼소히"
				description="100코인 모으면 천재.."
				action={
					<Chip tone="dark">
						세로형 게임
					</Chip>
				}
			/>

			<div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
				{/* 게임 스테이지 */}
				<section className="rounded-lg border border-ink-700 bg-surface-dark p-4 lg:p-8">
					{playing ? (
						<>
							<UnityGame />
							<div className="mt-4 flex justify-center">
								<Button variant="secondary" onClick={() => setPlaying(false)}>
									게임 끄기
								</Button>
							</div>
						</>
					) : (
						<div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
							<Image
								src={CHIBI.shotBlack}
								alt=""
								width={160}
								height={160}
								className="h-40 w-auto"
								priority
							/>
							<p className="text-h2 text-white">준비되셨나요?</p>
							<p className="max-w-[36ch] text-sm-lg text-ink-300">
								세로 화면에 맞춰 만든 러닝 게임입니다.
								{!isAuthenticated && " 로그인하면 점수가 랭킹에 기록돼요."}
							</p>
							<Button size="lg" onClick={() => setPlaying(true)}>
								시작하기
							</Button>
						</div>
					)}
				</section>

				{/* 점수 · 랭킹 */}
				<aside className="mt-8 lg:mt-0">
					{isAuthenticated && (
						<div className="mb-6 grid grid-cols-2 gap-2.5">
							<StatCard
								dark
								value={myScore.data?.bestScore ?? "-"}
								label="내 최고점수"
							/>
							<StatCard dark value={myScore.data?.rank ?? "-"} label="내 순위" />
						</div>
					)}

					<h2 className="mb-3 text-h2 text-white">랭킹 TOP 10</h2>
					<RankingList />
				</aside>
			</div>
		</div>
	);
}
