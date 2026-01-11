// src/features/diary/editor/constants.ts
import type { StatMeta } from "./types";

export const statMeta: StatMeta[] = [
	{ key: "pts", label: "득점", group: "득점" },

	{ key: "fg2Made", label: "2점 성공", group: "슈팅", compact: true },
	{ key: "fg2Att", label: "2점 시도", group: "슈팅", compact: true },
	{ key: "fg3Made", label: "3점 성공", group: "슈팅", compact: true },
	{ key: "fg3Att", label: "3점 시도", group: "슈팅", compact: true },

	{ key: "rebOff", label: "공격R", group: "리바운드", compact: true },
	{ key: "rebDef", label: "수비R", group: "리바운드", compact: true },

	{ key: "ast", label: "어시스트", group: "수비" },
	{ key: "stl", label: "스틸", group: "수비" },
	{ key: "blk", label: "블락", group: "수비" },

	{ key: "to", label: "턴오버", group: "기타" },
];
