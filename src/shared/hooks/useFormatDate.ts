// hooks/useFormatDate.ts
import { useCallback } from "react";

const useFormatDate = () => {
	const formatDate = useCallback((dateString: string): string => {
		const date = new Date(dateString);

		const pad = (num: number) => num.toString().padStart(2, "0");

		return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
			date.getUTCDate()
		)} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
			date.getUTCSeconds()
		)}`;
	}, []);

	return formatDate;
};

export default useFormatDate;
