"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDiaryByGameIdQuery } from "@/features/diary/queries";
import LoadingSpinner from "@/shared/ui/loadingSpinner";

export default function DiaryGameEntryPage() {
	const params = useParams();
	const router = useRouter();
	const gameId = (params?.gameId as string) || "";

	const { data: diary, isLoading, error } = useDiaryByGameIdQuery(
		gameId || null,
		!!gameId
	);

	useEffect(() => {
		if (!gameId) {
			router.replace("/diary/create");
			return;
		}
		if (isLoading) return;
		
		// 에러가 발생했지만 404가 아닌 경우에만 에러 처리
		// 404는 일지가 없는 정상 케이스이므로 무시
		if (error && (error as any)?.response?.status !== 404) {
			// 404가 아닌 에러는 일지 작성 페이지로 이동
			router.replace(`/diary/create?gameId=${encodeURIComponent(gameId)}`);
			return;
		}

		// 일지가 있으면 상세 페이지로, 없으면 작성 페이지로
		if (diary?.id) {
			router.replace(`/diary/${diary.id}`);
		} else {
			router.replace(`/diary/create?gameId=${encodeURIComponent(gameId)}`);
		}
	}, [diary, error, gameId, isLoading, router]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<LoadingSpinner />
		</div>
	);
}

