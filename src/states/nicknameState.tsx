import { atom } from "@/utils/globalState";

export const nicknameState = atom<string>({
	key: "nicknameState",
	default: "",
});
