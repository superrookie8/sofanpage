import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { fetchProfile } from "./api";

export const useProfileQuery = (nickname?: string) => {
	return useQuery({
		queryKey: [...queryKeys.user.profile(), nickname || "default"],
		queryFn: () => fetchProfile(nickname),
	});
};
