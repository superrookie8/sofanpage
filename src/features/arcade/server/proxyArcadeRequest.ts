import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
	BackendApiConfigurationError,
	resolveBackendApiUrl,
} from "../../../lib/server/http/backendApi";
import { readFetchResponseAsText } from "../../../lib/server/http/readFetchResponse";
import {
	reportSlackError,
	type SlackErrorEvent,
} from "../../../lib/server/alerts/slackErrorReporter";

interface ArcadeProxyOptions {
	/**
	 * 성공 응답(2xx)의 JSON 본문을 클라이언트로 넘기기 전에 가공한다.
	 * 백엔드가 내려주는 필드를 그대로 흘리지 않기 위한 화이트리스트 용도.
	 */
	sanitizeJson?: (data: unknown) => unknown;
	request: NextRequest;
	path: string;
	method?: "GET" | "POST";
	accessToken?: string | null;
	body?: unknown;
	environment?: Record<string, string | undefined>;
	fetchImplementation?: typeof fetch;
	reportError?: (event: SlackErrorEvent) => Promise<unknown>;
}

export async function proxyArcadeRequest({
	request,
	path,
	method = "GET",
	accessToken,
	body,
	sanitizeJson,
	environment = process.env,
	fetchImplementation = fetch,
	reportError = reportSlackError,
}: ArcadeProxyOptions) {
	let backendUrl: URL;
	try {
		backendUrl = new URL(path, `${resolveBackendApiUrl(environment)}/`);
		backendUrl.search = request.nextUrl.search;
	} catch (error) {
		if (error instanceof BackendApiConfigurationError) {
			await reportError({
				source: "backend-config",
				error,
				route: path,
				method,
				routeType: "route",
			});
			return NextResponse.json(
				{ message: "Backend API is not configured" },
				{ status: 500 }
			);
		}
		throw error;
	}

	let response: Response;
	try {
		response = await fetchImplementation(backendUrl, {
			method,
			headers: {
				Accept: "application/json",
				...(body === undefined ? {} : { "Content-Type": "application/json" }),
				...(accessToken
					? { Authorization: `Bearer ${accessToken}` }
					: {}),
			},
			body: body === undefined ? undefined : JSON.stringify(body),
			cache: "no-store",
		});
	} catch (error) {
		await reportError({
			source: "backend-connect",
			error,
			route: path,
			method,
			routeType: "route",
		});
		return NextResponse.json(
			{ message: "아케이드 서버에 연결하지 못했습니다." },
			{ status: 502 }
		);
	}

	let responseBody: string;
	try {
		responseBody = await readFetchResponseAsText(response);
	} catch (error) {
		await reportError({
			source: "backend-parse",
			error,
			route: path,
			method,
			routeType: "route",
		});
		return NextResponse.json(
			{ message: "Invalid backend response" },
			{ status: 502 }
		);
	}

	// 성공 응답만 가공한다. upstream HTTP 오류는 backend 소유라 알림 없이 전달한다.
	if (sanitizeJson && response.ok && responseBody) {
		try {
			responseBody = JSON.stringify(sanitizeJson(JSON.parse(responseBody)));
		} catch (error) {
			await reportError({
				source: "backend-parse",
				error,
				route: path,
				method,
				routeType: "route",
			});
			return NextResponse.json(
				{ message: "Invalid backend response" },
				{ status: 502 }
			);
		}
	}

	return new NextResponse(responseBody || null, {
		status: response.status,
		headers: {
			"Cache-Control": "no-store",
			"Content-Type":
				response.headers.get("content-type") || "application/json; charset=utf-8",
		},
	});
}
