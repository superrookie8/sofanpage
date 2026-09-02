import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { notifyAdminError } from "../alerts/slack";
import { clearAdminSession, getAdminToken } from "./session";

const PRESERVED_ERROR_STATUSES = new Set([
	400, 401, 403, 404, 409, 413, 422, 429,
]);

function backendBaseUrl(): string {
	const value =
		process.env.BACKEND_API_URL ??
		process.env.BACKAPI_URL ??
		process.env.NEXT_PUBLIC_BACKAPI_URL;
	if (!value) throw new Error("BACKEND_API_URL 환경 변수가 필요합니다.");
	return value.replace(/\/$/, "");
}

async function responseBody(response: Response): Promise<unknown> {
	const text = await response.text();
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch {
		return { message: text };
	}
}

function backendErrorCategory(error: unknown) {
	if (error instanceof Error && ["AbortError", "TimeoutError"].includes(error.name)) {
		return "backend_timeout" as const;
	}
	if (error instanceof SyntaxError) return "backend_response" as const;
	return "backend_connection" as const;
}

async function alertBackendFailure(
	operation: string,
	path: string,
	error: unknown
): Promise<void> {
	await notifyAdminError({
		operation,
		route: path,
		status: 502,
		category: backendErrorCategory(error),
	});
}

export async function adminBackendFetch(
	path: string,
	init: RequestInit = {}
): Promise<NextResponse> {
	const token = await getAdminToken();
	if (!token) {
		return NextResponse.json({ message: "관리자 로그인이 필요합니다." }, { status: 401 });
	}

	try {
		const headers = new Headers(init.headers);
		headers.set("Authorization", `Bearer ${token}`);
		const response = await fetch(`${backendBaseUrl()}${path}`, {
			...init,
			headers,
			cache: "no-store",
		});
		const body = await responseBody(response);
		const status = response.ok
			? response.status
			: PRESERVED_ERROR_STATUSES.has(response.status) || response.status >= 500
				? response.status
				: 502;
		const result = body === null && [204, 205, 304].includes(status)
			? new NextResponse(null, { status })
			: NextResponse.json(body, { status });
		if (status === 401) clearAdminSession(result);
		return result;
	} catch (error) {
		await alertBackendFailure("adminBackendFetch", path, error);
		const message = error instanceof Error ? error.message : "백엔드 연결에 실패했습니다.";
		return NextResponse.json({ message }, { status: 502 });
	}
}

export async function adminBackendBinaryFetch(path: string): Promise<NextResponse> {
	const token = await getAdminToken();
	if (!token) {
		return NextResponse.json({ message: "관리자 로그인이 필요합니다." }, { status: 401 });
	}
	try {
		const response = await fetch(`${backendBaseUrl()}${path}`, {
			headers: { Authorization: `Bearer ${token}` },
			cache: "no-store",
		});
		if (!response.ok) {
			const body = await responseBody(response);
			const status = PRESERVED_ERROR_STATUSES.has(response.status) || response.status >= 500
				? response.status
				: 502;
			const result = NextResponse.json(body, { status });
			if (status === 401) clearAdminSession(result);
			return result;
		}
		return new NextResponse(await response.arrayBuffer(), {
			status: response.status,
			headers: {
				"Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
				"Cache-Control": "private, no-store",
				"X-Content-Type-Options": "nosniff",
			},
		});
	} catch (error) {
		await alertBackendFailure("adminBackendBinaryFetch", path, error);
		const message = error instanceof Error ? error.message : "백엔드 연결에 실패했습니다.";
		return NextResponse.json({ message }, { status: 502 });
	}
}

export async function backendLogin(credentials: {
	username: string;
	password: string;
}): Promise<{ response: Response; body: Record<string, unknown> | null }> {
	try {
		const response = await fetch(`${backendBaseUrl()}/api/admin/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(credentials),
			cache: "no-store",
		});
		const body = (await responseBody(response)) as Record<string, unknown> | null;
		return { response, body };
	} catch (error) {
		await alertBackendFailure("backendLogin", "/api/admin/login", error);
		throw error;
	}
}

export function clientErrorMessage(body: unknown, fallback: string): string {
	if (!body || typeof body !== "object") return fallback;
	const value = body as Record<string, unknown>;
	for (const key of ["message", "error", "msg"]) {
		const candidate = value[key];
		if (typeof candidate === "string" && candidate) return candidate;
	}
	return fallback;
}
