export type LegacySchedule = {
	_id: string;
	season: string;
	date: string;
	opponent: string;
	isHome: boolean;
	time: string;
	extraHome?: string;
	specialGame?: boolean;
	isActive?: boolean;
};

type SpringSchedule = {
	id: string;
	season: string;
	date: string;
	time: string;
	opponent: string;
	isHome: boolean;
	extraHome?: string;
	specialGame?: boolean;
	isActive?: boolean;
};

export function toLegacySchedule(value: SpringSchedule): LegacySchedule {
	return {
		_id: value.id,
		season: value.season,
		date: value.date,
		time: value.time,
		opponent: value.opponent,
		isHome: value.isHome,
		extraHome: value.extraHome,
		specialGame: value.specialGame,
		isActive: value.isActive,
	};
}

export function legacyScheduleRequest(value: LegacySchedule) {
	return {
		season: value.season,
		date: value.date,
		time: value.time,
		opponent: value.opponent,
		isHome: value.isHome,
		extraHome: value.extraHome || null,
		specialGame: value.specialGame ?? false,
		isActive: value.isActive ?? true,
	};
}

export type LegacyStats = {
	_id?: string;
	season: string;
	average: Record<string, string | number>;
	total: Record<string, string | number>;
};

export class StatsValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "StatsValidationError";
	}
}

export const DUPLICATE_STATS_SEASON_MESSAGE =
	"이미 같은 시즌 기록이 있습니다. 기존 시즌을 선택해 수정해 주세요.";

export function emptyStatsDraft(): LegacyStats {
	return {
		season: "",
		average: {
			G: "0", MPG: "00:00", "2P%": "0", "3P%": "0", FT: "0", OFF: "0", DEF: "0",
			TOT: "0", APG: "0", SPG: "0", BPG: "0", TO: "0", PF: "0", PPG: "0",
		},
		total: {
			MIN: "00:00", "FGM-A": "0-0", "3PM-A": "0-0", "FTM-A": "0-0", OFF: "0",
			DEF: "0", TOT: "0", AST: "0", STL: "0", BLK: "0", TO: "0", PF: "0", PTS: "0",
		},
	};
}

export function hasDuplicateStatsSeason(stats: LegacyStats[], season: string): boolean {
	const candidate = season.trim();
	return Boolean(candidate) && stats.some((stat) => stat.season.trim() === candidate);
}

function nonNegativeDecimal(value: unknown, label: string, max?: number): number {
	const input = String(value ?? "").trim();
	if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(input)) {
		throw new StatsValidationError(`${label}은(는) 0 이상의 숫자로 입력해 주세요.`);
	}
	const parsed = Number(input);
	if (!Number.isFinite(parsed) || parsed < 0 || (max !== undefined && parsed > max)) {
		throw new StatsValidationError(
			max === undefined
				? `${label}은(는) 0 이상의 숫자로 입력해 주세요.`
				: `${label}은(는) 0부터 ${max} 사이의 숫자로 입력해 주세요.`
		);
	}
	return parsed;
}

function nonNegativeInteger(value: unknown, label: string): number {
	const input = String(value ?? "").trim();
	if (!/^\d+$/.test(input)) {
		throw new StatsValidationError(`${label}은(는) 0 이상의 정수로 입력해 주세요.`);
	}
	const parsed = Number(input);
	if (!Number.isSafeInteger(parsed)) {
		throw new StatsValidationError(`${label}은(는) 안전한 범위의 정수로 입력해 주세요.`);
	}
	return parsed;
}

function splitMadeAttempted(value: unknown, label: string): [number, number] {
	const parts = String(value ?? "").trim().split("-");
	if (parts.length !== 2) {
		throw new StatsValidationError(`${label}은(는) 성공-시도 형식으로 입력해 주세요.`);
	}
	return [
		nonNegativeInteger(parts[0], `${label} 성공`),
		nonNegativeInteger(parts[1], `${label} 시도`),
	];
}

export function legacyStatsRequest(value: LegacyStats): Record<string, unknown> {
	const season = value.season.trim();
	if (!/^\d{4}-\d{4}$/.test(season)) {
		throw new StatsValidationError("시즌은 YYYY-YYYY 형식으로 입력해 주세요.");
	}
	const [twoPointMade, twoPointAttempted] = splitMadeAttempted(value.total["FGM-A"], "2점슛");
	const [threePointMade, threePointAttempted] = splitMadeAttempted(value.total["3PM-A"], "3점슛");
	const [freeThrowMade, freeThrowAttempted] = splitMadeAttempted(value.total["FTM-A"], "자유투");
	return {
		season,
		team: "부산 BNK 썸",
		gamesPlayed: nonNegativeInteger(value.average.G, "경기 수"),
		minutesPerGame: value.average.MPG,
		twoPointPercent: nonNegativeDecimal(value.average["2P%"], "2점슛 성공률", 100),
		threePointPercent: nonNegativeDecimal(value.average["3P%"], "3점슛 성공률", 100),
		freeThrowPercent: nonNegativeDecimal(value.average.FT, "자유투 성공률", 100),
		offensiveRebounds: nonNegativeDecimal(value.average.OFF, "평균 공격 리바운드"),
		defensiveRebounds: nonNegativeDecimal(value.average.DEF, "평균 수비 리바운드"),
		totalRebounds: nonNegativeDecimal(value.average.TOT, "평균 리바운드"),
		apg: nonNegativeDecimal(value.average.APG, "평균 어시스트"),
		spg: nonNegativeDecimal(value.average.SPG, "평균 스틸"),
		bpg: nonNegativeDecimal(value.average.BPG, "평균 블록"),
		turnovers: nonNegativeDecimal(value.average.TO, "평균 턴오버"),
		fouls: nonNegativeDecimal(value.average.PF, "평균 파울"),
		ppg: nonNegativeDecimal(value.average.PPG, "평균 득점"),
		totalMinutes: value.total.MIN,
		twoPointMade,
		twoPointAttempted,
		threePointMade,
		threePointAttempted,
		freeThrowMade,
		freeThrowAttempted,
		totalOffensiveRebounds: nonNegativeInteger(value.total.OFF, "총 공격 리바운드"),
		totalDefensiveRebounds: nonNegativeInteger(value.total.DEF, "총 수비 리바운드"),
		totalTotalRebounds: nonNegativeInteger(value.total.TOT, "총 리바운드"),
		totalAssists: nonNegativeInteger(value.total.AST, "총 어시스트"),
		totalSteals: nonNegativeInteger(value.total.STL, "총 스틸"),
		totalBlocks: nonNegativeInteger(value.total.BLK, "총 블록"),
		totalTurnovers: nonNegativeInteger(value.total.TO, "총 턴오버"),
		totalFouls: nonNegativeInteger(value.total.PF, "총 파울"),
		totalPoints: nonNegativeInteger(value.total.PTS, "총 득점"),
	};
}

export function statsFormDraft(value: LegacyStats): LegacyStats {
	return {
		...value,
		average: Object.fromEntries(
			Object.entries(value.average).map(([key, field]) => [key, String(field ?? "")])
		),
		total: Object.fromEntries(
			Object.entries(value.total).map(([key, field]) => [key, String(field ?? "")])
		),
	};
}

export function toLegacyStats(value: Record<string, unknown>): LegacyStats {
	return {
		_id: String(value.id ?? ""),
		season: String(value.season ?? ""),
		average: {
			G: Number(value.gamesPlayed ?? 0), MPG: String(value.minutesPerGame ?? "00:00"),
			"2P%": Number(value.twoPointPercent ?? 0), "3P%": Number(value.threePointPercent ?? 0),
			FT: Number(value.freeThrowPercent ?? 0), OFF: Number(value.offensiveRebounds ?? 0),
			DEF: Number(value.defensiveRebounds ?? 0), TOT: Number(value.totalRebounds ?? 0),
			APG: Number(value.apg ?? 0), SPG: Number(value.spg ?? 0), BPG: Number(value.bpg ?? 0),
			TO: Number(value.turnovers ?? 0), PF: Number(value.fouls ?? 0), PPG: Number(value.ppg ?? 0),
		},
		total: {
			MIN: String(value.totalMinutes ?? "00:00"),
			"FGM-A": `${Number(value.twoPointMade ?? 0)}-${Number(value.twoPointAttempted ?? 0)}`,
			"3PM-A": `${Number(value.threePointMade ?? 0)}-${Number(value.threePointAttempted ?? 0)}`,
			"FTM-A": `${Number(value.freeThrowMade ?? 0)}-${Number(value.freeThrowAttempted ?? 0)}`,
			OFF: Number(value.totalOffensiveRebounds ?? 0), DEF: Number(value.totalDefensiveRebounds ?? 0),
			TOT: Number(value.totalTotalRebounds ?? 0), AST: Number(value.totalAssists ?? 0),
			STL: Number(value.totalSteals ?? 0), BLK: Number(value.totalBlocks ?? 0),
			TO: Number(value.totalTurnovers ?? 0), PF: Number(value.totalFouls ?? 0),
			PTS: Number(value.totalPoints ?? 0),
		},
	};
}

export type LegacyProfile = {
	name: string;
	team: string;
	position: string;
	number: string;
	height: string;
	nickname: string;
	features: string;
	profileImageUrl?: string | null;
};

export function toLegacyProfile(value: Record<string, unknown>): LegacyProfile {
	const nicknames = Array.isArray(value.nicknames)
		? value.nicknames.filter((item): item is string => typeof item === "string")
		: [];
	return {
		name: String(value.name ?? ""),
		team: String(value.team ?? ""),
		position: String(value.position ?? ""),
		number: String(value.jerseyNumber ?? ""),
		height: String(value.height ?? ""),
		nickname: nicknames.join(", "),
		features: String(value.features ?? ""),
		profileImageUrl: typeof value.profileImageUrl === "string" ? value.profileImageUrl : null,
	};
}

export function legacyProfileRequest(value: LegacyProfile) {
	return {
		name: value.name.trim(),
		team: value.team.trim(),
		position: value.position.trim(),
		jerseyNumber: Number(value.number),
		height: value.height.trim(),
		nicknames: value.nickname.split(",").map((item) => item.trim()).filter(Boolean),
		features: value.features.trim(),
		profileImageUrl: value.profileImageUrl || null,
	};
}

export type LegacyGuestbookEntry = {
	_id: string;
	name: string;
	message: string;
	date: string;
	photo_id?: string;
	photo_data?: string;
	hasPhoto?: boolean;
};

export function toLegacyGuestbook(value: Record<string, unknown>): LegacyGuestbookEntry {
	return {
		_id: String(value.id ?? ""),
		name: String(value.name ?? ""),
		message: String(value.message ?? ""),
		date: String(value.date ?? ""),
		photo_id: typeof value.photoId === "string" ? value.photoId : undefined,
		photo_data: typeof value.photoData === "string" ? value.photoData : undefined,
		hasPhoto: Boolean(value.hasPhoto),
	};
}

export function toLegacyAdminGuestbook(value: Record<string, unknown>): LegacyGuestbookEntry {
	const adapted = toLegacyGuestbook(value);
	return adapted.hasPhoto && !adapted.photo_data
		? { ...adapted, photo_data: `/api/admin/getguestbookphoto?entry_id=${encodeURIComponent(adapted._id)}` }
		: adapted;
}

export type AdminPhoto = {
	id: string;
	filename: string;
	contentType: string;
	contentUrl: string;
};

export type AdminPhotoGroups = {
	adminPhotos: AdminPhoto[];
	userPhotos: AdminPhoto[];
};

function toAdminPhoto(value: unknown): AdminPhoto | null {
	if (!value || typeof value !== "object") return null;
	const photo = value as Record<string, unknown>;
	const id = String(photo.id ?? "").trim();
	if (!id) return null;
	return {
		id,
		filename: String(photo.filename ?? "photo"),
		contentType: String(photo.contentType ?? "application/octet-stream"),
		contentUrl: `/api/admin/photos/${encodeURIComponent(id)}/content`,
	};
}

export function toAdminPhotoGroups(value: unknown): AdminPhotoGroups {
	const body = value && typeof value === "object"
		? value as Record<string, unknown>
		: {};
	const mapPhotos = (photos: unknown) => Array.isArray(photos)
		? photos.map(toAdminPhoto).filter((photo): photo is AdminPhoto => photo !== null)
		: [];
	return {
		adminPhotos: mapPhotos(body.adminPhotos),
		userPhotos: mapPhotos(body.userPhotos),
	};
}

export function normalizePhotoIds(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return Array.from(new Set(value
		.filter((item): item is string => typeof item === "string")
		.map((item) => item.trim())
		.filter(Boolean)));
}
