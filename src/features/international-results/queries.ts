import { useQuery } from "@tanstack/react-query";
import { fetchInternationalResults } from "./api";

export function useInternationalResultsQuery() {
	return useQuery({
		queryKey: ["international-results", "public"],
		queryFn: fetchInternationalResults,
		staleTime: 1000 * 60 * 10,
	});
}
