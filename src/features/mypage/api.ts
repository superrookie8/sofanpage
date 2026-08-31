export interface UserInfo {
	nickname: string;
	description?: string;
	photoUrl?: string;
	createdAt?: string;
}

export interface MyArcadeScore {
	bestScore: number | null;
	rank: number | null;
}

export async function fetchUserInfo(): Promise<UserInfo> {
	const response = await fetch("/api/users/me", { cache: "no-store" });
	if (!response.ok) {
		throw new Error("사용자 정보를 불러오지 못했습니다");
	}
	return response.json();
}

/**
 * 아케이드 최고점수. 백엔드 응답 키가 확정적이지 않아 방어적으로 읽는다.
 * 비로그인/미플레이(404 등)는 빈 값으로 처리해 마이페이지 전체를 막지 않는다.
 */
export async function fetchMyArcadeScore(): Promise<MyArcadeScore> {
	const response = await fetch("/api/arcade/my-score", { cache: "no-store" });
	if (!response.ok) {
		return { bestScore: null, rank: null };
	}
	const data = (await response.json()) as Record<string, unknown>;
	const pick = (...keys: string[]) => {
		for (const key of keys) {
			const value = data[key];
			if (typeof value === "number") return value;
		}
		return null;
	};
	return {
		bestScore: pick("bestScore", "best_score", "score", "highScore"),
		rank: pick("rank", "ranking", "myRank"),
	};
}
