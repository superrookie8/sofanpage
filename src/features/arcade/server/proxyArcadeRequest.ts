import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
	BackendApiConfigurationError,
	resolveBackendApiUrl,
} from "../../../lib/server/http/backendApi";
import { readFetchResponseAsText } from "../../../lib/server/http/readFetchResponse";

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
}: ArcadeProxyOptions) {
	let backendUrl: URL;
	try {
		backendUrl = new URL(path, `${resolveBackendApiUrl(environment)}/`);
		backendUrl.search = request.nextUrl.search;
	} catch (error) {
		if (error instanceof BackendApiConfigurationError) {
			return NextResponse.json(
				{ message: "Backend API is not configured" },
				{ status: 500 }
			);
		}
		throw error;
	}

	try {
		const response = await fetchImplementation(backendUrl, {
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
		let responseBody = await readFetchResponseAsText(response);

		// 성공 응답만 가공한다. 에러 본문은 그대로 통과시켜 진단 정보를 잃지 않는다.
		if (sanitizeJson && response.ok && responseBody) {
			try {
				responseBody = JSON.stringify(sanitizeJson(JSON.parse(responseBody)));
			} catch {
				// JSON이 아니면 가공하지 않고 그대로 둔다.
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
	} catch {
		return NextResponse.json(
			{ message: "아케이드 서버에 연결하지 못했습니다." },
			{ status: 502 }
		);
	}
}
