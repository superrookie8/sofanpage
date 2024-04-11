import { atom } from "recoil";
import { Location, locations } from "@/data/schedule";

export const selectedLocationState = atom<Location | null>({
	key: "selectedLocationState",
	default: locations["부산 사직실내체육관"],
});
