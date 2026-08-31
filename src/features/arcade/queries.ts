import { useQuery } from "@tanstack/react-query";
import { fetchRanking } from "./api";

export const useArcadeRankingQuery = (limit = 10) =>
	useQuery({
		queryKey: ["arcade", "ranking", limit],
		queryFn: () => fetchRanking(limit),
		staleTime: 1000 * 30,
	});
