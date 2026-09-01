export interface ProfileData {
	id: string;
	name: string;
	team: string;
	jerseyNumber: number;
	/** 국가대표팀 등번호. 없으면 null. */
	nationalTeamJerseyNumber?: number | null;
	position: string;
	height: string;
	nickname: string[];
	features: string;
	profileImageUrl?: string | null;
}
