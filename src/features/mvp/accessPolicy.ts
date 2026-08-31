const DISABLED_PAGE_PREFIXES = [
	"/diary",
	"/signup",
	"/mypage",
	"/guestbooks",
];

const DISABLED_API_PREFIXES = [
	"/api/diary",
	"/api/photos",
	"/api/images/upload",
	"/api/guestbooks",
	"/api/users/me",
	"/api/auth/login",
	"/api/auth/signup",
	"/api/auth/check-email",
	"/api/auth/check-nickname",
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
