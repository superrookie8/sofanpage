import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authEnvironment } from "@/config/auth";
import { readFetchResponseAsText } from "@/lib/server/http/readFetchResponse";

interface ArcadeProxyOptions {
	request: NextRequest;
	path: string;
	method?: "GET" | "POST";
	accessToken?: string | null;
	body?: unknown;
}

export async function proxyArcadeRequest({
	request,
	path,
	method = "GET",
	accessToken,
	body,
}: ArcadeProxyOptions) {
	const backendUrl = new URL(path, `${authEnvironment.backendApiUrl}/`);
	backendUrl.search = request.nextUrl.search;

	try {
		const response = await fetch(backendUrl, {
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
