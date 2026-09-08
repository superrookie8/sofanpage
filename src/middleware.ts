import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import {
	isMvpDisabledApi,
	isMvpDisabledPage,
} from "@/features/mvp/accessPolicy";

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	if (pathname === "/admin" || pathname.startsWith("/admin/")) {
		let token = null;
		try {
			if (process.env.NEXTAUTH_SECRET) token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
		} catch { /* Invalid sessions remain anonymous. */ }
		if (!token?.backendAccessToken || pathname === "/admin/login") {
			const login = new URL("/login", request.url);
			login.searchParams.set("callbackUrl", pathname === "/admin/login" ? "/admin" : `${pathname}${request.nextUrl.search}`);
			return NextResponse.redirect(login);
		}
	}


	if (isMvpDisabledApi(pathname)) {
		return NextResponse.json(
			{ message: "This feature is not available in the MVP." },
			{ status: 404 }
		);
	}

	if (isMvpDisabledPage(pathname)) {
		return NextResponse.redirect(new URL("/unavailable", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/admin/:path*",
		"/diary/:path*",
		"/signup",
		"/mypage",
		"/guestbooks/:path*",
		"/api/diary/:path*",
		"/api/photos/:path*",
		"/api/events/:eventId/photos/:path*",
		"/api/images/upload/:path*",
		"/api/guestbooks/:path*",
		"/api/users/me",
		"/api/auth/login",
		"/api/auth/signup",
		"/api/auth/check-email",
		"/api/auth/check-nickname",
	],
};
