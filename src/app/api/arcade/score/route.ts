import { NextRequest, NextResponse } from "next/server";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";
import { proxyArcadeRequest } from "@/features/arcade/server/proxyArcadeRequest";

export async function POST(request: NextRequest) {
	const accessToken = await getRequestAccessToken(request);
	if (!accessToken) {
		return NextResponse.json(
			{ message: "로그인이 필요합니다." },
			{ status: 401 }
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ message: "점수 요청 형식이 올바르지 않습니다." },
			{ status: 400 }
		);
	}

	if (
		typeof body !== "object" ||
		body === null ||
		!("score" in body) ||
		!Number.isInteger(body.score) ||
		(body.score as number) < 0
	) {
		return NextResponse.json(
			{ message: "점수는 0 이상의 정수여야 합니다." },
			{ status: 400 }
		);
	}

	return proxyArcadeRequest({
		request,
		path: "/api/arcade/score",
		method: "POST",
		accessToken,
		body: { score: body.score },
	});
}
