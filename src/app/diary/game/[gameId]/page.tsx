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
		if (!gameId) return;
		if (isLoading) return;
		if (error) return;

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

