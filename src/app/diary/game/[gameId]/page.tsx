"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDiaryCheckByGameIdQuery } from "@/features/diary/queries";
import LoadingSpinner from "@/shared/ui/loadingSpinner";

export default function DiaryGameEntryPage() {
	const params = useParams();
	const router = useRouter();
	const gameId = (params?.gameId as string) || "";

	const { data: check, isLoading, isError } = useDiaryCheckByGameIdQuery(
		gameId || null,
		!!gameId
	);

	useEffect(() => {
		if (!gameId) {
			router.replace("/diary/create");
			return;
		}
		if (isLoading) return;
		if (isError) {
			router.replace(`/diary/create?gameId=${encodeURIComponent(gameId)}`);
			return;
		}

		if (check?.exists && check.diaryId) {
			router.replace(`/diary/${check.diaryId}/edit`);
		} else {
			router.replace(`/diary/create?gameId=${encodeURIComponent(gameId)}`);
		}
	}, [check, gameId, isError, isLoading, router]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<LoadingSpinner />
		</div>
	);
}
