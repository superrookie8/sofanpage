export type InternationalResultCategory =
	| "NATIONAL_TEAM"
	| "CLUB"
	| "EXHIBITION";

export type InternationalResultStatus =
	| "SCHEDULED"
	| "IN_PROGRESS"
	| "FINAL";

export interface InternationalResultSource {
	label: string;
	url: string;
	type: "OFFICIAL" | "SECONDARY";
}

export interface InternationalResult {
	id: string;
	competitionKey: string;
	competitionName: string;
	editionLabel: string;
	category: InternationalResultCategory;
	status: InternationalResultStatus;
	participationStatus: "UNCONFIRMED" | "CONFIRMED";
	startDate: string;
	endDate: string;
	location: string;
	teamName: string;
	teamResult: string | null;
	teamRecord: string | null;
	gamesPlayed: number | null;
	minutesPerGame: string | null;
	pointsPerGame: number | null;
	reboundsPerGame: number | null;
	assistsPerGame: number | null;
	stealsPerGame: number | null;
	fieldGoalPercent: number | null;
	threePointPercent: number | null;
	freeThrowPercent: number | null;
	highlight: string | null;
	statsUpdatedThrough: string | null;
	sources: InternationalResultSource[];
	published: boolean;
	displayOrder: number;
	createdAt: string;
	updatedAt: string;
}
