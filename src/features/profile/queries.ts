import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { fetchProfile } from "./api";
import type { ProfileData } from "./types";

export const useProfileQuery = (
	nickname?: string,
	options?: { initialData?: ProfileData | null }
) => {
	return useQuery({
		queryKey: [...queryKeys.user.profile(), nickname || "default"],
		queryFn: () => fetchProfile(nickname),
		// 서버에서 프리페치한 프로필이 있으면 첫 렌더부터 실제 콘텐츠를 그린다.
		initialData: options?.initialData ?? undefined,
	});
};
