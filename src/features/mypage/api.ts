export interface UserInfo {
	nickname: string;
	profileImageUrl?: string | null;
	createdAt?: string;
}

export interface MyArcadeScore {
	bestScore: number | null;
	rank: number | null;
}

export async function fetchUserInfo(): Promise<UserInfo> {
	const response = await fetch("/api/users/me", { cache: "no-store" });
	if (!response.ok) {
		throw new Error("사용자 정보를 불러오지 못했습니다");
	}
	return response.json();
}

/**
 * 아케이드 최고점수. 백엔드 응답 키가 확정적이지 않아 방어적으로 읽는다.
 * 비로그인/미플레이(404 등)는 빈 값으로 처리해 마이페이지 전체를 막지 않는다.
 */
export async function fetchMyArcadeScore(): Promise<MyArcadeScore> {
	const response = await fetch("/api/arcade/my-score", { cache: "no-store" });
	if (!response.ok) {
		return { bestScore: null, rank: null };
	}
	const data = (await response.json()) as Record<string, unknown>;
	const pick = (...keys: string[]) => {
		for (const key of keys) {
			const value = data[key];
			if (typeof value === "number") return value;
		}
		return null;
	};
	return {
		bestScore: pick("bestScore", "best_score", "score", "highScore"),
		rank: pick("rank", "ranking", "myRank"),
	};
}

export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 20;
/** 백엔드 UserService의 규칙과 같아야 한다. */
const NICKNAME_PATTERN = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9._-]+$/;

export const PROFILE_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

export class ProfileValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ProfileValidationError";
	}
}

/** 서버에 보내기 전에 같은 규칙으로 먼저 걸러 왕복을 줄인다. */
export function validateNickname(nickname: string): string {
	const trimmed = nickname.trim();
	if (
		trimmed.length < NICKNAME_MIN_LENGTH ||
		trimmed.length > NICKNAME_MAX_LENGTH ||
		!NICKNAME_PATTERN.test(trimmed)
	) {
		throw new ProfileValidationError(
			`닉네임은 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자의 한글, 영문, 숫자, . _ - 만 쓸 수 있어요`
		);
	}
	return trimmed;
}

export function validateProfileImage(file: File): File {
	if (!PROFILE_IMAGE_ACCEPT.split(",").includes(file.type)) {
		throw new ProfileValidationError("JPG, PNG, WEBP 이미지만 올릴 수 있어요");
	}
	if (file.size > MAX_PROFILE_IMAGE_BYTES) {
		throw new ProfileValidationError("이미지는 5MB 이하만 올릴 수 있어요");
	}
	return file;
}

async function errorMessage(response: Response, fallback: string) {
	try {
		const body = await response.json();
		return typeof body?.message === "string" && body.message ? body.message : fallback;
	} catch {
		return fallback;
	}
}

export async function checkNicknameAvailable(nickname: string): Promise<boolean> {
	const response = await fetch(
		`/api/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`,
		{ cache: "no-store" }
	);
	if (!response.ok) {
		throw new Error(await errorMessage(response, "닉네임을 확인하지 못했어요"));
	}
	const data = (await response.json()) as { available?: boolean };
	return data.available === true;
}

/**
 * 이미지를 먼저 올려 R2 키를 받는다. 키는 프로필 저장 요청에만 싣고,
 * 화면에 보여줄 주소는 서버가 서명된 URL로 바꿔 돌려준다.
 */
export async function uploadProfileImage(file: File): Promise<string> {
	const formData = new FormData();
	formData.append("file", validateProfileImage(file));

	const response = await fetch("/api/users/me/photo", {
		method: "POST",
		body: formData,
	});
	if (!response.ok) {
		throw new Error(await errorMessage(response, "이미지를 올리지 못했어요"));
	}
	const data = (await response.json()) as { key?: string };
	if (!data.key) {
		throw new Error("이미지를 올리지 못했어요");
	}
	return data.key;
}

export interface ProfileUpdate {
	nickname?: string;
	/** R2 키. 빈 문자열이면 기본 이미지로 되돌린다. */
	profileImageUrl?: string;
}

export async function updateUserInfo(update: ProfileUpdate): Promise<UserInfo> {
	const response = await fetch("/api/users/me", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(update),
	});
	if (!response.ok) {
		throw new Error(await errorMessage(response, "프로필을 저장하지 못했어요"));
	}
	return response.json();
}
