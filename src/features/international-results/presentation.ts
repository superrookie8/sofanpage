import type {
	InternationalResult,
	InternationalResultCategory,
	InternationalResultStatus,
} from "./types";

export type InternationalResultFilter = "ALL" | InternationalResultCategory;
export const INTERNATIONAL_RESULTS_PAGE_SIZE = 4;

export interface InternationalResultsViewState {
	filter: InternationalResultFilter;
	page: number;
}

export type InternationalResultsViewAction =
	| { type: "FILTER"; filter: InternationalResultFilter }
	| { type: "PAGE"; page: number };

export function internationalResultsViewReducer(
	state: InternationalResultsViewState,
	action: InternationalResultsViewAction
): InternationalResultsViewState {
	if (action.type === "FILTER") {
		return { filter: action.filter, page: 1 };
	}
	return { ...state, page: Math.max(1, action.page) };
}

export function clampInternationalResultsPage(page: number, totalPages: number) {
	return Math.min(Math.max(1, page), Math.max(1, totalPages));
}

export function paginateInternationalResults<T>(
	results: T[],
	page: number,
	pageSize = INTERNATIONAL_RESULTS_PAGE_SIZE
) {
	const start = (page - 1) * pageSize;
	return results.slice(start, start + pageSize);
}

export const CATEGORY_LABELS: Record<InternationalResultCategory, string> = {
	NATIONAL_TEAM: "국가대표",
	CLUB: "구단 국제대회",
	EXHIBITION: "평가전",
};

export const STATUS_LABELS: Record<InternationalResultStatus, string> = {
	SCHEDULED: "예정",
	IN_PROGRESS: "진행 중",
	FINAL: "최종",
};

export function visibleInternationalResults(
	results: InternationalResult[],
	filter: InternationalResultFilter
) {
	return results
		.filter(
			(result) =>
				result.published && (filter === "ALL" || result.category === filter)
		)
		.sort(
			(a, b) =>
				a.displayOrder - b.displayOrder ||
				b.startDate.localeCompare(a.startDate) ||
				a.id.localeCompare(b.id)
		);
}

export function safeSourceUrl(value: string): string | null {
	try {
		const url = new URL(value);
		return url.protocol === "https:" || url.protocol === "http:"
			? url.toString()
			: null;
	} catch {
		return null;
	}
}

export function formatCompetitionDate(startDate: string, endDate: string) {
	const format = (value: string) => {
		const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
		if (!match) return value;
		return `${match[1]}.${Number(match[2])}.${Number(match[3])}.`;
	};
	const start = format(startDate);
	const end = format(endDate);
	return startDate === endDate ? start : `${start} – ${end}`;
}
