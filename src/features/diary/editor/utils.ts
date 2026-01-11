// src/features/diary/editor/utils.ts

export function uid(): string {
	return Math.random().toString(36).slice(2, 9);
}

export function pct(made: number | "", att: number | ""): string {
	if (made === "" || att === "") return "—";
	if (att === 0) return "0%";
	const v = Math.round((made / att) * 100);
	return `${v}%`;
}
