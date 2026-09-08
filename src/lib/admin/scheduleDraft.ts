import { currentSeason, type GameSchedule } from "./schedule";

/** A new record may reuse competition identity, never the edited game's record identity or match data. */
export function createScheduleDraft(context?: Partial<GameSchedule>): GameSchedule {
	const base: GameSchedule = { _id: "", season: currentSeason(), date: "", time: "", opponent: "", isHome: true, extraHome: "", specialGame: false,
		competitionKey: "wkbl", competitionName: "WKBL", competitionKind: "league", editionLabel: currentSeason(), teamType: "club", ourTeamName: "BNK 썸", venueType: "home", venueName: "", stadiumId: "", stage: "" };
	if (!context?.competitionKey || !context.competitionName || !context.editionLabel || !context.teamType || !context.ourTeamName || !context.venueType) return base;
	return { ...base, competitionKey: context.competitionKey, competitionName: context.competitionName, competitionKind: context.competitionKind,
		editionLabel: context.editionLabel, teamType: context.teamType, ourTeamName: context.ourTeamName, season: context.season || "", venueType: context.venueType, isHome: context.venueType === "home" };
}
