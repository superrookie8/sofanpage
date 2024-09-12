// 통계 데이터를 가져오는 함수 추가
export const fetchUserStats = async (
	nickname: string
): Promise<{
	win_percentage: number;
	sunny_percentage: number;
	home_win_percentage: number;
	away_win_percentage: number;
	attendance_percentage: number;
}> => {
	try {
		const response = await fetch(`/api/getdiarystats?nickname=${nickname}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch user stats");
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching user stats:", error);
		return {
			win_percentage: 0,
			sunny_percentage: 0,
			home_win_percentage: 0,
			away_win_percentage: 0,
			attendance_percentage: 0,
		}; // 오류 발생 시 기본 값 반환
	}
};
