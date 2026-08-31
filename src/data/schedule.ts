export interface GameSchedule {
	_id: string;
	season: string;
	date: string;
	opponent: string;
	isHome: boolean;
	time: string;
	extraHome?: string | undefined;
	specialGame?: boolean;
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
	"삼성생명": {
		name: "용인실내체육관",
		latitude: 37.2377,
		longitude: 127.2135,
	},
	"하나은행": { name: "부천체육관", latitude: 37.5134, longitude: 126.7632 },
	// 과거 데이터 호환용 별칭 (2024년까지 구단명이 하나원큐였다)
	"하나원큐": { name: "부천체육관", latitude: 37.5134, longitude: 126.7632 },
	"우리은행": {
		name: "아산 이순신체육관",
		latitude: 36.7693,
		longitude: 127.0248,
	},
	"신한은행": {
		name: "인천 도원체육관",
		latitude: 37.4661,
		longitude: 126.6408,
	},
	"KB스타즈": { name: "청주체육관", latitude: 36.6365, longitude: 127.4734 },
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

// 상대 팀 (경기 일정의 opponent 값). 체육관 이름이 아니라 구단명을 저장한다.
export const OPPONENT_TEAMS = [
	"우리은행",
	"삼성생명",
	"KB스타즈",
	"신한은행",
	"하나은행",
] as const;

// 홈 경기를 사직실내체육관이 아닌 곳에서 치를 때 고르는 대체 홈 구장.
export const EXTRA_HOME_VENUES = [
	"창원 실내체육관",
	"마산 실내체육관",
	"울산 동천체육관",
	"부산은행 연수원",
] as const;

// 시간 프리셋. 이 외의 시간은 직접 입력한다.
export const TIME_PRESETS = ["14:00", "16:00", "18:00", "19:00"] as const;

/** 오늘 날짜가 속한 WKBL 시즌 문자열(YYYY-YYYY)을 돌려준다. */
export function currentSeason(today: Date = new Date()): string {
	const year = today.getFullYear();
	return today.getMonth() + 1 >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

/** "YYYY-YYYY" 형식이면서 뒤 연도가 앞 연도 + 1 인지 검사한다. */
export function isValidSeason(value: string): boolean {
	const match = /^(\d{4})-(\d{4})$/.exec(value.trim());
	return match !== null && Number(match[2]) === Number(match[1]) + 1;
}
