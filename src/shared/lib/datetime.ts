const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

function startOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	return next;
}

export function parseDate(value: string | Date | null | undefined): Date | null {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

/** "10.14" */
export function formatMonthDay(value: string | Date) {
	const date = parseDate(value);
	if (!date) return "-";
	return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")}`;
}

/** "화" */
export function formatWeekday(value: string | Date) {
	const date = parseDate(value);
	return date ? WEEKDAYS[date.getDay()] : "";
}

/** "19:00" */
export function formatTime(value: string | Date) {
	const date = parseDate(value);
	if (!date) return "";
	return `${String(date.getHours()).padStart(2, "0")}:${String(
		date.getMinutes()
	).padStart(2, "0")}`;
}

/** "D-7" / "D-DAY" / 지난 경기는 null */
export function formatCountdown(
	value: string | Date,
	now: Date = new Date()
): string | null {
	const date = parseDate(value);
	if (!date) return null;
	const days = Math.round(
		(startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000
	);
	if (days < 0) return null;
	return days === 0 ? "D-DAY" : `D-${days}`;
}

/** "3시간 전" / "어제" / "2026.08.20" */
export function formatRelativeTime(
	value: string | Date,
	now: Date = new Date()
): string {
	const date = parseDate(value);
	if (!date) return "";

	const diffMs = now.getTime() - date.getTime();
	const diffMinutes = Math.floor(diffMs / 60_000);

	if (diffMinutes < 1) return "방금 전";
	if (diffMinutes < 60) return `${diffMinutes}분 전`;

	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours}시간 전`;

	const diffDays = Math.round(
		(startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000
	);
	if (diffDays === 1) return "어제";
	if (diffDays < 7) return `${diffDays}일 전`;

	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
		2,
		"0"
	)}.${String(date.getDate()).padStart(2, "0")}`;
}
