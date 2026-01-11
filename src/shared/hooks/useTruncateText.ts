// hooks/useTruncateText.ts
import { useCallback } from "react";

const useTruncateText = (maxLength: number) => {
	const truncateText = useCallback(
		(text: string): string => {
			if (text.length <= maxLength) {
				return text;
			}
			return text.substring(0, maxLength) + "...";
		},
		[maxLength]
	);

	return truncateText;
};

export default useTruncateText;
