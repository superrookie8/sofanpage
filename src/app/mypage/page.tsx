"use client";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageHeader from "@/shared/ui/primitives/pageHeader";
import Card from "@/shared/ui/primitives/card";
import StatCard from "@/shared/ui/primitives/statCard";
import Button from "@/shared/ui/primitives/button";
import { Skeleton } from "@/shared/ui/primitives/skeleton";
import { ErrorState } from "@/shared/ui/primitives/states";
import { isMvpDisabledPage } from "@/features/mvp/accessPolicy";
import {
	useMyArcadeScoreQuery,
	useUserInfoQuery,
} from "@/features/mypage/queries";

function joinedLabel(createdAt?: string) {
	if (!createdAt) return null;
	const date = new Date(createdAt);
	if (Number.isNaN(date.getTime())) return null;
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
		2,
		"0"
	)}부터 팬`;
}

/** 시안 §6 — 프로필 카드 → 활동 요약 → 설정 리스트 */
export default function MyPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated";

	const userInfo = useUserInfoQuery(isAuthenticated);
	const arcadeScore = useMyArcadeScoreQuery(isAuthenticated);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.replace("/login?callbackUrl=/mypage");
		}
	}, [router, status]);

	if (status === "loading" || (isAuthenticated && userInfo.isLoading)) {
		return (
			<div className="flex flex-col gap-4">
				<Skeleton className="h-[104px] rounded-md" />
				<Skeleton className="h-[104px] rounded-md" />
			</div>
		);
	}

	if (!isAuthenticated) return null;

	if (userInfo.isError) {
		return <ErrorState onRetry={() => userInfo.refetch()} />;
	}

	const nickname =
		userInfo.data?.nickname || session?.user?.name || "팬";
	const joined = joinedLabel(userInfo.data?.createdAt);
	const photoUrl = userInfo.data?.photoUrl;

	// 아직 공개하지 않은 섹션은 accessPolicy를 따른다.
	const diaryEnabled = !isMvpDisabledPage("/diary/read");
	const guestbookEnabled = !isMvpDisabledPage("/guestbooks/read");

	const handleLogout = async () => {
		try {
			await signOut({ redirect: false, callbackUrl: "/home" });
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			window.location.href = "/home";
		}
	};

	return (
		<div>
			<PageHeader title="마이페이지" />

			<Card className="flex items-center gap-4 p-4">
				<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-brand-100">
					{photoUrl ? (
						<Image
							src={photoUrl}
							alt=""
							fill
							sizes="64px"
							className="object-cover"
							unoptimized
						/>
					) : (
						<Image
							src="/images/leesohee.png"
							alt=""
							fill
							sizes="64px"
							className="object-contain p-1"
						/>
					)}
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate text-h2 text-ink-900">{nickname}</p>
					{joined && <p className="mt-0.5 text-caption text-ink-500">{joined}</p>}
				</div>
			</Card>

			<section className="mt-6">
				<h2 className="mb-3 text-h2">활동</h2>
				<div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
					<StatCard
						value={arcadeScore.data?.bestScore ?? "-"}
						label="최고점수"
					/>
					<StatCard value={arcadeScore.data?.rank ?? "-"} label="내 순위" />
				</div>
			</section>

			<section className="mt-6">
				<h2 className="mb-3 text-h2">설정</h2>
				<Card className="divide-y divide-ink-100">
					{diaryEnabled && (
						<Link
							href="/diary/read"
							className="flex min-h-[52px] items-center justify-between px-4 text-[15px] text-ink-700"
						>
							내가 쓴 직관 일기 <span className="text-ink-300">›</span>
						</Link>
					)}
					{guestbookEnabled && (
						<Link
							href="/guestbooks/read"
							className="flex min-h-[52px] items-center justify-between px-4 text-[15px] text-ink-700"
						>
							내가 쓴 방명록 <span className="text-ink-300">›</span>
						</Link>
					)}
					<Link
						href="/arcade"
						className="flex min-h-[52px] items-center justify-between px-4 text-[15px] text-ink-700"
					>
						아케이드 랭킹 보기 <span className="text-ink-300">›</span>
					</Link>
					<button
						type="button"
						onClick={handleLogout}
						className="flex min-h-[52px] w-full items-center px-4 text-left text-[15px] font-semibold text-brand-700"
					>
						로그아웃
					</button>
				</Card>
			</section>

			<div className="mt-6 lg:hidden">
				<Button variant="secondary" fullWidth onClick={() => router.push("/home")}>
					홈으로
				</Button>
			</div>
		</div>
	);
}
