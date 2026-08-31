import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
	BackendApiConfigurationError,
	resolveBackendApiUrl,
} from "../../../lib/server/http/backendApi";
import { readFetchResponseAsText } from "../../../lib/server/http/readFetchResponse";

interface ArcadeProxyOptions {
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
		const responseBody = await readFetchResponseAsText(response);

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
