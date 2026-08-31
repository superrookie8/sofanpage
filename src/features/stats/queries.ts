import { useQuery } from "@tanstack/react-query";
import { fetchSeasonStats } from "./api";

export const useSeasonStatsQuery = () =>
	useQuery({
		queryKey: ["stats", "season"],
		queryFn: fetchSeasonStats,
		staleTime: 1000 * 60 * 5,
	});
