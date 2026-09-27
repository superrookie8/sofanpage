import "server-only";
import { resolveBackendApiUrl } from "@/lib/server/http/backendApi";
import type { ProfileData } from "./types";

/**
 * 홈 히어로용 서버 프리페치. 실패하면 null을 돌려 클라이언트 쿼리가
 * 기존처럼 스켈레톤 → fetch 경로로 이어지게 한다(LCP 최적화는 best-effort).
 */
export async function getProfileForHero(): Promise<ProfileData | null> {
	try {
		const response = await fetch(`${resolveBackendApiUrl()}/api/player`, {
			headers: { "Content-Type": "application/json" },
			next: { revalidate: 300 },
		});
		if (!response.ok) return null;
		return (await response.json()) as ProfileData;
	} catch (error) {
		console.error("Hero profile prefetch failed:", error);
		return null;
	}
}
