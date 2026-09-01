// 직관 일기·방명록은 아직 공개 단계가 아니다. 회원가입은 소셜 로그인 전용
// 전환으로 별도 화면을 두지 않는다. 마이페이지는 공개한다.
//
// 마이페이지 프로필 수정에 필요한 두 경로는 열어 둔다.
// - /api/auth/check-nickname: 닉네임 중복 확인
// - /api/users/me/photo: 프로필 사진 전용 업로드
// 다이어리용 /api/images/upload는 계속 닫아 두므로, 사진 업로드가 통째로
// 열리지 않는다.
const DISABLED_PAGE_PREFIXES = ["/diary", "/signup", "/guestbooks"];

const DISABLED_API_PREFIXES = [
	"/api/diary",
	"/api/photos",
	"/api/images/upload",
	"/api/guestbooks",
	"/api/auth/login",
	"/api/auth/signup",
	"/api/auth/check-email",
];

function matchesPrefix(pathname: string, prefix: string) {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isMvpDisabledPage(pathname: string) {
	return DISABLED_PAGE_PREFIXES.some((prefix) =>
		matchesPrefix(pathname, prefix)
	);
}

export function isMvpDisabledApi(pathname: string) {
	return (
		DISABLED_API_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix)) ||
		/^\/api\/events\/[^/]+\/photos(?:\/|$)/.test(pathname)
	);
}
