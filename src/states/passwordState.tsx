import { atom } from "@/utils/globalState";

export const passwordState = atom<string>({
	key: "passwordState",
	default: "",
});
