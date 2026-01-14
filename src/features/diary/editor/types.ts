// src/features/diary/editor/types.ts

export type WatchType = "직관" | "집관";

export interface BaseInfo {
	date: string;
	time: string;
	location: string; // 경기장 이름 (드롭다운에서 선택)
	/**
	 * games 테이블의 실제 game id
	 * - 백엔드 Diary API의 gameId에 들어가야 하는 값
	 * - stadiumId(경기장 id)와 절대 혼용하면 안 됨
	 */
	gameId?: string;
	stadiumId?: string; // 경기장 ID
	watchType: WatchType;
	companions: string;
	result: "승" | "패";
	// 좌석 정보 (드롭다운으로 선택)
	seatId?: string;
	seatZone?: string;
	seatBlock?: string;
	seatRow?: string;
	seatNumber?: string;
}

export type StatKey =
	| "pts"
	| "fg2Made"
	| "fg2Att"
	| "fg3Made"
	| "fg3Att"
	| "rebOff"
	| "rebDef"
	| "ast"
	| "stl"
	| "blk"
	| "to";

export interface PlayerStats {
	id: string;
	name: string;
	team?: string;
	stats: Record<StatKey, number | "">;
}

export interface MVP {
	name: string;
	reason: string;
}

export interface Highlights {
	overtime: boolean;
	injury: boolean;
	referee: boolean;
	bestMood: boolean;
	worstMood: boolean;
	custom: string;
}

export interface DiaryDraft {
	base: BaseInfo;
	mvp: MVP;
	players: PlayerStats[];
	highlights: Highlights;
	// 사진 (R2 key 또는 빈 문자열)
	ticketPhoto: string; // 티켓 사진
	viewPhoto: string; // 경기장 사진
	additionalPhoto: string; // 추가 사진
	memo: string;
}

export interface StatMeta {
	key: StatKey;
	label: string;
	hint?: string;
	group: "득점" | "슈팅" | "리바운드" | "수비" | "기타";
	compact?: boolean;
}
