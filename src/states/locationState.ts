import { atom } from "recoil";
import { GameLocation } from "@/features/games/types";
import { locations } from "@/features/games/constants";

export const selectedLocationState = atom<GameLocation | null>({
	key: "selectedLocationState",
	default: locations["부산 사직실내체육관"],
});

export const locatonState = atom<string>({
	key: "locationState",
	default: "부산 사직실내체육관",
});
