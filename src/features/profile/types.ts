export interface ProfileData {
	id: string;
	name: string;
	team: string;
	jerseyNumber: number;
	position: string;
	height: string;
	nickname: string[];
	features: string;
	profileImageUrl?: string | null;
}
