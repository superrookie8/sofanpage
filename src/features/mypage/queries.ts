import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	fetchMyArcadeScore,
	fetchUserInfo,
	updateUserInfo,
	type ProfileUpdate,
	type UserInfo,
} from "./api";

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

export const useUpdateUserInfoMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (update: ProfileUpdate) => updateUserInfo(update),
		onSuccess: (updated: UserInfo) => {
			// 저장 응답이 최신이므로 재조회 없이 캐시를 바로 맞춘다.
			queryClient.setQueryData(["user", "me"], updated);
		},
	});
};
