import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
	isMvpDisabledApi,
	isMvpDisabledPage,
} from "@/features/mvp/accessPolicy";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

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
