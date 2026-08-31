import { NextRequest, NextResponse } from "next/server";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";
import { resolveBackendApiUrl } from "@/lib/server/http/backendApi";

function isHtmlResponse(contentType: string, body: string) {
	const normalizedBody = body.trim().toLowerCase();
	return (
		contentType.includes("text/html") ||
		normalizedBody.startsWith("<!doctype") ||
		normalizedBody.startsWith("<html")
	);
}

function parseResponseBody(body: string, contentType: string): unknown {
	if (contentType.includes("application/json") || body.trim().startsWith("{")) {
		return JSON.parse(body);
	}
	return body.trim();
}

export async function POST(request: NextRequest) {
	const token = await getRequestAccessToken(request);

	if (!token) {
		return NextResponse.json(
			{ message: "Authentication required" },
			{ status: 401 }
		);
	}

	let backendBaseUrl: string;
	try {
		backendBaseUrl = resolveBackendApiUrl();
	} catch {
		return NextResponse.json(
			{ message: "Image service is not configured" },
			{ status: 503 }
		);
	}

	try {
		const formData = await request.formData();
		const file = formData.get("file");
		if (!(file instanceof File)) {
			return NextResponse.json(
				{ message: "No file provided" },
				{ status: 400 }
			);
		}

		const backendFormData = new FormData();
		backendFormData.append("file", file);

		const response = await fetch(`${backendBaseUrl}/api/images/upload`, {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: backendFormData,
			cache: "no-store",
		});
		const responseBody = await response.text();
		const contentType = response.headers.get("content-type") || "";

		if (isHtmlResponse(contentType, responseBody)) {
			return NextResponse.json(
				{ message: "Image service returned an invalid response" },
				{ status: 502 }
			);
		}

		let data: unknown;
		try {
			data = parseResponseBody(responseBody, contentType);
		} catch {
			return NextResponse.json(
				{ message: "Image service returned an invalid response" },
				{ status: 502 }
			);
		}

		if (!response.ok) {
			const message =
				typeof data === "object" &&
				data !== null &&
				"message" in data &&
				typeof data.message === "string"
					? data.message
					: "Failed to upload image";
			return NextResponse.json({ message }, { status: response.status });
		}

		return NextResponse.json(data, { status: 200 });
	} catch {
		// 인증 헤더, token, upstream 본문은 로그에 남기지 않는다.
		console.error("Image upload request failed");
		return NextResponse.json(
			{ message: "Failed to upload image" },
			{ status: 502 }
		);
	}
}
