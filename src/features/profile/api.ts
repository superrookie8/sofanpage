import type { ProfileData } from "./types";

export const fetchProfile = async (nickname?: string): Promise<ProfileData> => {
	const url = nickname
		? `/api/profile?nickname=${encodeURIComponent(nickname)}`
		: "/api/profile";

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message || "프로필 조회 실패");
	}

	return response.json();
};
