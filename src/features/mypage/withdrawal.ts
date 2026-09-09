export const WITHDRAWAL_CONFIRMATION = "회원 탈퇴";
export const WITHDRAWAL_SUMMARY =
	"계정과 프로필, 계정과 연결된 직관일지, 아케이드 기록을 영구적으로 삭제합니다.";
const WITHDRAWAL_ACCOUNT_MARKER = "supersohee.withdrawal.expected-account";

type MarkerStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/**
 * OAuth 왕복 중 다른 계정을 고르는 실수를 막는 짧은 marker다.
 * 삭제의 보안 경계는 backend JWT의 최근 발급 시각 검증이며 이 값 자체는 권한이 아니다.
 */
export function markWithdrawalAccount(storage: MarkerStorage, accountId: string) {
	if (!accountId.trim()) return false;
	try {
		storage.setItem(WITHDRAWAL_ACCOUNT_MARKER, accountId);
		return true;
	} catch {
		return false;
	}
}

/** marker는 일치 여부와 관계없이 한 번 읽은 즉시 제거한다. */
export function consumeWithdrawalAccountMarker(
	storage: MarkerStorage,
	currentAccountId: string
) {
	try {
		const expectedAccountId = storage.getItem(WITHDRAWAL_ACCOUNT_MARKER);
		storage.removeItem(WITHDRAWAL_ACCOUNT_MARKER);
		return {
			expectedAccountId,
			matches: Boolean(expectedAccountId && expectedAccountId === currentAccountId),
		};
	} catch {
		return { expectedAccountId: null, matches: false };
	}
}

export function clearWithdrawalAccountMarker(storage: MarkerStorage) {
	try {
		storage.removeItem(WITHDRAWAL_ACCOUNT_MARKER);
	} catch {
		// 저장소를 사용할 수 없으면 marker 기반 확인 단계도 열리지 않는다.
	}
}

const ERROR_MESSAGES: Record<number, string> = {
	400: "확인 문구를 정확히 입력해 주세요.",
	401: "로그인 정보가 만료되었습니다. 다시 로그인해 주세요.",
	403: "요청 출처를 확인할 수 없습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.",
	412: "안전한 탈퇴를 위해 소셜 계정으로 다시 인증해 주세요.",
	503: "회원 탈퇴 기능을 준비하고 있습니다. 잠시 후 다시 시도해 주세요.",
};

export class WithdrawalError extends Error {
	constructor(public readonly status: number) {
		super(ERROR_MESSAGES[status] ?? "회원 탈퇴를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
		this.name = "WithdrawalError";
	}
}

export async function deleteAccount(confirmation: string): Promise<void> {
	const response = await fetch("/api/users/me", {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ confirmation }),
	});
	if (!response.ok) throw new WithdrawalError(response.status);
}
