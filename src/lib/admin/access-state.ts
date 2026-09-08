export function adminAccessFailure(status: number, sessionStatus: "loading" | "authenticated" | "unauthenticated") {
	if (status === 401) return sessionStatus === "unauthenticated" ? "login" : "reauth";
	return status === 403 ? "forbidden" : "retry";
}
