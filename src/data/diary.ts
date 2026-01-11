export interface DiaryEntry {
	id: string;
	userId: string;
	gameId: string;
	watchType: "DIRECT" | "HOUSE";
	content: string;
	photoUrls: string[]; // 서명된 URL 배열
	seatId?: string;
	seatRow: string;
	seatNumber: string;
	companion?: string[];
	mvpPlayerName?: string;
	cheeredPlayerName?: string;
	gameHomeScore?: number;
	gameAwayScore?: number;
	gameWinner?: "HOME" | "AWAY";
	cheeredPlayerPoints?: number;
	cheeredPlayerAssists?: number;
	cheeredPlayerRebounds?: number;
	cheeredPlayerTwoPointMade?: number;
	cheeredPlayerTwoPointPercent?: number;
	cheeredPlayerThreePointMade?: number;
	cheeredPlayerThreePointPercent?: number;
	cheeredPlayerFreeThrowMade?: number;
	cheeredPlayerFreeThrowPercent?: number;
	cheeredPlayerFouls?: number;
	cheeredPlayerBlocks?: number;
	cheeredPlayerTurnovers?: number;
	cheeredPlayerMemo?: string;
	createdAt: string;
	updatedAt: string;
	// 하위 호환성을 위한 필드들 (점진적 마이그레이션)
	_id?: string;
	nickname?: string;
	name?: string;
	date?: string;
	weather?: string;
	location?: string;
	together?: string;
	win_status?: string;
	diary_photos?: {
		ticket_photo: string;
		view_photo: string;
		additional_photo?: string;
	};
	diary_message?: string;
	seat_info?: {
		section: string;
		row: string;
		number: string;
	};
}

