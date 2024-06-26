export interface GameSchedule {
	_id: string;
	season: string;
	date: string;
	opponent: string;
	isHome: boolean;
	time: string;
	extraHome?: string | undefined;
}

export interface GameLocation {
	name: string;
	latitude: number;
	longitude: number;
}

export const locations: Record<string, GameLocation> = {
	"부산 사직실내체육관": {
		name: "부산 사직실내체육관",
		latitude: 35.1922,
		longitude: 129.061,
	},
	삼성생명: {
		name: "용인실내체육관",
		latitude: 37.2377,
		longitude: 127.2135,
	},
	하나원큐: { name: "부천체육관", latitude: 37.5134, longitude: 126.7632 },
	우리은행: {
		name: "아산 이순신체육관",
		latitude: 36.7693,
		longitude: 127.0248,
	},
	신한은행: {
		name: "인천 도원체육관",
		latitude: 37.4661,
		longitude: 126.6408,
	},
	KB스타즈: { name: "청주체육관", latitude: 36.6365, longitude: 127.4734 },
	"부산은행 연수원": {
		name: "부산은행 연수원",
		latitude: 35.2747,
		longitude: 129.236,
	},

	"창원 실내체육관": {
		name: "창원 실내체육관",
		latitude: 35.2271,
		longitude: 128.6811,
	},
	"마산 실내체육관": {
		name: "마산 실내체육관",
		latitude: 35.2224,
		longitude: 128.5817,
	},
	"울산 동천체육관": {
		name: "울산 동천체육관",
		latitude: 35.5399,
		longitude: 129.3179,
	},
};

//2023-2024 schedule

// export const schedules: GameSchedule[] = [
// 	{ date: "2023-11-05", opponent: "우리은행", isHome: false, time: "14:00" },
// 	{ date: "2023-11-10", opponent: "신한은행", isHome: false, time: "19:00" },
// 	{ date: "2023-11-12", opponent: "하나원큐", isHome: false, time: "18:00" },
// 	{ date: "2023-11-16", opponent: "삼성생명", isHome: false, time: "19:00" },
// 	{ date: "2023-11-20", opponent: "KB스타즈", isHome: true, time: "19:00" },
// 	{ date: "2023-11-25", opponent: "하나원큐", isHome: true, time: "14:00" },
// 	{ date: "2023-11-29", opponent: "삼성생명", isHome: true, time: "19:00" },
// 	{ date: "2023-12-02", opponent: "신한은행", isHome: false, time: "18:00" },
// 	{ date: "2023-12-04", opponent: "우리은행", isHome: true, time: "19:00" },
// 	{ date: "2023-12-07", opponent: "KB스타즈", isHome: false, time: "19:00" },
// 	{ date: "2023-12-10", opponent: "하나원큐", isHome: false, time: "18:00" },
// 	{ date: "2023-12-14", opponent: "삼성생명", isHome: true, time: "19:00" },
// 	{ date: "2023-12-17", opponent: "신한은행", isHome: true, time: "14:00" },
// 	{ date: "2023-12-20", opponent: "우리은행", isHome: false, time: "19:00" },
// 	{ date: "2023-12-23", opponent: "KB스타즈", isHome: false, time: "18:00" },
// 	{ date: "2023-12-28", opponent: "우리은행", isHome: true, time: "19:00" },
// 	{ date: "2023-12-31", opponent: "KB스타즈", isHome: true, time: "14:00" },
// 	{ date: "2024-01-13", opponent: "하나원큐", isHome: true, time: "14:00" },
// 	{ date: "2024-01-18", opponent: "신한은행", isHome: true, time: "19:00" },
// 	{ date: "2024-01-20", opponent: "삼성생명", isHome: false, time: "18:00" },
// 	{ date: "2024-01-26", opponent: "KB스타즈", isHome: true, time: "19:00" },
// 	{ date: "2024-01-29", opponent: "신한은행", isHome: false, time: "19:00" },
// 	{ date: "2024-02-01", opponent: "하나원큐", isHome: false, time: "19:00" },
// 	{ date: "2024-02-03", opponent: "우리은행", isHome: false, time: "18:00" },
// 	{ date: "2024-02-09", opponent: "삼성생명", isHome: true, time: "14:00" },
// 	{ date: "2024-02-14", opponent: "KB스타즈", isHome: false, time: "19:00" },
// 	{ date: "2024-02-17", opponent: "신한은행", isHome: false, time: "14:00" },
// 	{ date: "2024-02-22", opponent: "하나원큐", isHome: false, time: "19:00" },
// 	{ date: "2024-02-25", opponent: "우리은행", isHome: false, time: "14:00" },
// 	{ date: "2024-02-28", opponent: "삼성생명", isHome: true, time: "19:00" },
// ];
