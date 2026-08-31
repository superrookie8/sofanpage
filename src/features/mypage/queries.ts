import { useQuery } from "@tanstack/react-query";
import { fetchMyArcadeScore, fetchUserInfo } from "./api";

export const useUserInfoQuery = (enabled: boolean) =>
	useQuery({
		queryKey: ["user", "me"],
		queryFn: fetchUserInfo,
		enabled,
		retry: false,
	});

export const useMyArcadeScoreQuery = (enabled: boolean) =>
	useQuery({
		queryKey: ["arcade", "my-score"],
		queryFn: fetchMyArcadeScore,
		enabled,
		retry: false,
	});
