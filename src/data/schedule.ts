export interface GameSchedule {
	_id: string;
	season: string;
	date: string;
	opponent: string;
	isHome: boolean;
	time: string;
	extraHome?: string | undefined;
	specialGame?: string | undefined;
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
	"아산 이순신체육관": {
		name: "아산 이순신체육관",
		latitude: 36.7693,
		longitude: 127.0248,
	},
	"부천 체육관": { name: "부천체육관", latitude: 37.5134, longitude: 126.7632 },
	"인천 도원체육관": {
		name: "인천 도원체육관",
		latitude: 37.4661,
		longitude: 126.6408,
	},
	"용인 실내체육관": {
		name: "용인실내체육관",
		latitude: 37.2377,
		longitude: 127.2135,
	},
	"청주 체육관": { name: "청주체육관", latitude: 36.6365, longitude: 127.4734 },
};

export interface DirectionInfo {
	name: string;
	info: string;
	capacity: number;
	bus: string;
	subway: string;
}

export const directionguide: Record<string, DirectionInfo> = {
	"부산 사직실내체육관": {
		name: "부산 사직실내체육관",
		info: "부산시 동래구 사직동에 위치",
		capacity: 14099,
		bus: "46번 버스 사직야구장,\n80번, 105번, 111번 버스 창신초등학교,\n10번, 210번, 부산진구17번 버스 아시아드 주경기장,\n54번, 83-1번, 131번 사직실내수영장 하차 ",
		subway: "지하철 3호선 종합운동장역 9번 11번 출구",
	},
	삼성생명: {
		name: "용인실내체육관",
		info: "경기도 용인시 처인구 마평동에 위치",
		capacity: 1914,
		bus: "66번, 66-4번 운동장 송담대역 (그외 다수),\n5005번 용인터미널,용인교",
		subway: "에버라인 용인중앙시장 2번 출구",
	},
	하나원큐: {
		name: "부천체육관",
		info: "경기도 부천시 원미구 중동에 위치",
		capacity: 5400,
		bus: "70-3번, 6-2번 버스 중원고등학교,\n60-1번 버스 부천테크노파크4단지 401동 앞,\n50-1번 버스 부천체육관.부천초교사거리/ 83번, 5-4번 버스부천체육관북문,\n302번 부천실내체육관,\n8번 버스 중원초교 ",
		subway: "7호선 부천시청역 4번 출구",
	},
	우리은행: {
		name: "아산 이순신체육관",
		info: "충청남도 아산시 서원구 풍기동에 위치",
		capacity: 3176,
		bus: "990번, 991번 버스 아산경찰서 / 동일하이빌A,\n900번, 910번 버스 모종2통\n시즌 시 셔틀버스 운행",
		subway: "1호선 아산역 -> 버스환승,\n1호선 온양온천역 -> 버스환승",
	},
	신한은행: {
		name: "인천 도원체육관",
		info: "인천시 중구 도원동에 위치",
		capacity: 2630,
		bus: "521번, 519번 버스 신흥시장,\n15번 버스 도원고개(도원역),\n4번, 112번 인천옹진농협본점,\n4번, 23번, 45번 숭의로터리.도원체육관 ",
		subway: "1호선 도원역 1번 출구",
	},
	KB스타즈: {
		name: "청주체육관",
		info: "충청북도 청주시 서원구 사직동에 위치",
		capacity: 4183,
		bus: "618번, 311번, 511번, 513번, 514번, \n516번, 101번, 711번, 814번 버스 청주체육관,\n105번, 114번 버스 시계탑,\n109번, 502번 버스 사직사거리.시립미술관(교육도서관),\n813번 버스 예술의전당.유네스코국제기록유산센터",
		subway: "None",
	},
	"용인 실내체육관": {
		name: "용인실내체육관",
		info: "경기도 용인시 처인구 마평동에 위치",
		capacity: 1914,
		bus: "66번, 66-4번 운동장 송담대역 (그외 다수),\n5005번 용인터미널,용인교",
		subway: "에버라인 용인중앙시장 2번 출구",
	},
	"부천 체육관": {
		name: "부천체육관",
		info: "경기도 부천시 원미구 중동에 위치",
		capacity: 5400,
		bus: "70-3번, 6-2번 버스 중원고등학교,\n60-1번 버스 부천테크노파크4단지 401동 앞,\n50-1번 버스 부천체육관.부천초교사거리/ 83번, 5-4번 버스부천체육관북문,\n302번 부천실내체육관,\n8번 버스 중원초교 ",
		subway: "7호선 부천시청역 4번 출구",
	},
	"아산 이순신체육관": {
		name: "아산 이순신체육관",
		info: "충청남도 아산시 서원구 풍기동에 위치",
		capacity: 3176,
		bus: "990번, 991번 버스 아산경찰서 / 동일하이빌A,\n900번, 910번 버스 모종2통\n시즌 시 셔틀버스 운행",
		subway: "1호선 아산역 -> 버스환승,\n1호선 온양온천역 -> 버스환승",
	},
	"인천 도원체육관": {
		name: "인천 도원체육관",
		info: "인천시 중구 도원동에 위치",
		capacity: 2630,
		bus: "521번, 519번 버스 신흥시장,\n15번 버스 도원고개(도원역),\n4번, 112번 인천옹진농협본점,\n4번, 23번, 45번 숭의로터리.도원체육관 ",
		subway: "1호선 도원역 1번 출구",
	},
	"청주 체육관": {
		name: "청주체육관",
		info: "충청북도 청주시 서원구 사직동에 위치",
		capacity: 4183,
		bus: "618번, 311번, 511번, 513번, 514번, \n516번, 101번, 711번, 814번 버스 청주체육관,\n105번, 114번 버스 시계탑,\n109번, 502번 버스 사직사거리.시립미술관(교육도서관),\n813번 버스 예술의전당.유네스코국제기록유산센터",
		subway: "None",
	},
	// "부산은행 연수원": {
	// 	name: "부산은행 연수원",
	// 	info: "",
	// 	bus: "",
	// 	subway: "",
	// },

	// "창원 실내체육관": {
	// 	name: "창원 실내체육관",
	// 	info: "",
	// 	bus: "",
	// 	subway: "",
	// },
	// "마산 실내체육관": {
	// 	name: "마산 실내체육관",
	// 	info: "",
	// 	bus: "",
	// 	subway: "",
	// },
	// "울산 동천체육관": {
	// 	name: "울산 동천체육관",
	// 	info: "",
	// 	bus: "",
	// 	subway: "",
	// },
};
