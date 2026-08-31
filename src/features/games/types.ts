// src/features/games/types.ts
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

export interface DirectionInfo {
	name: string;
	info: string;
	capacity: number;
	bus: string;
	subway: string;
}

export interface RecommendedRoute {
	explain: string;
}

// 새로운 스케줄 API 응답 타입
export interface ScheduleResponse {
	id: string;
	title: string;
	description: string | null;
	startDateTime: string; // ISO 8601 형식 (예: "2024-01-15T10:00:00")
	endDateTime: string; // ISO 8601 형식
	location: string | null;
	type: string; // "game", "event", "other" 등
	color: string; // hex 색상 코드 (예: "#FF5733")
	url: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	/**
	 * 주의: 이름과 의미가 다르다. 상대팀이 아니라 **원정 경기장 이름**이며
	 * constants의 locations 조회 키로 쓰인다. 상대팀 이름은 `title`에 있다.
	 */
	opponent?: string;
	/**
	 * @deprecated 실제 응답에 담기지 않는다. 홈/원정 판정은 `location === "Home"`
	 * 으로 해야 한다. scheduleView의 isHomeGame()을 쓸 것.
	 */
	isHome?: boolean;
}

// 스케줄 상세 정보 응답 타입
export interface StadiumInfo {
	id: string;
	name: string; // 경기장 이름 (예: "부산 사직실내체육관")
	address: string; // 주소
	capacity: number; // 수용인원
	latitude: number; // 지도 좌표 (위도)
	longitude: number; // 지도 좌표 (경도)
	imageUrl: string | null; // 경기장 이미지 URL
	subwayInfo: string[] | null; // 교통정보: 지하철 (배열)
	busInfo: string[] | null; // 교통정보: 버스 (배열)
	intercityRoute: string | null; // 교통정보: 시외교통 (KTX, 시외버스 등)
}

export interface ScheduleDetailsResponse {
	// 기본 스케줄 정보
	id: string;
	title: string;
	description: string | null;
	startDateTime: string; // ISO 8601 형식 (예: "2024-01-15T10:00:00")
	endDateTime: string; // ISO 8601 형식
	location: string | null;
	type: string; // "game", "event", "other" 등
	color: string; // hex 색상 코드 (예: "#FF5733")
	url: string | null;
	isActive: boolean;
	// 경기장 정보 (stadiumId가 있을 때만 포함, 없으면 null)
	stadium: StadiumInfo | null;
	// 직관일지 바로가기용 gameId (있으면 직관일지 작성/조회 가능)
	gameId: string | null;
	createdAt: string;
	updatedAt: string;
}
