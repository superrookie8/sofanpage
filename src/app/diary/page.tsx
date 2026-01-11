// src/app/diary/page.tsx
// 리스트 화면으로 리다이렉트
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DiaryPage() {
	const router = useRouter();
	
	useEffect(() => {
		router.replace("/diary/read");
	}, [router]);

	return null;
}
