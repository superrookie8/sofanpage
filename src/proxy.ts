import { NextRequest, NextResponse } from "next/server.js";

const COOKIE_NAME = "supersohee_admin_session";

export function proxy(request: NextRequest) {
	const path = request.nextUrl.pathname;
	const hasSession = Boolean(request.cookies.get(COOKIE_NAME)?.value);

	if (path === "/admin/login") {
		if (hasSession) return NextResponse.redirect(new URL("/admin", request.url));
		return NextResponse.next();
	}

	if (!hasSession) {
		const login = new URL("/admin/login", request.url);
		login.searchParams.set("next", path);
		return NextResponse.redirect(login);
	}

	return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
