import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_SESSION_COOKIE = "supersohee_admin_session";

const sessionCookieOptions = {
	httpOnly: true,
	sameSite: "strict" as const,
	secure: process.env.NODE_ENV === "production",
	path: "/",
};

export function getAdminToken(): string | null {
	return cookies().get(ADMIN_SESSION_COOKIE)?.value ?? null;
}

export function setAdminSession(response: NextResponse, token: string) {
	response.cookies.set(ADMIN_SESSION_COOKIE, token, {
		...sessionCookieOptions,
		maxAge: 60 * 60 * 8,
	});
}

export function clearAdminSession(response: NextResponse) {
	response.cookies.set(ADMIN_SESSION_COOKIE, "", {
		...sessionCookieOptions,
		maxAge: 0,
	});
}

export function isTokenExpired(token: string): boolean {
	try {
		const payload = JSON.parse(
			Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8")
		) as { exp?: number };
		return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
	} catch {
		return true;
	}
}
