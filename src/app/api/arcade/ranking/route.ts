import { NextRequest, NextResponse } from "next/server";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";
import { proxyArcadeRequest } from "@/features/arcade/server/proxyArcadeRequest";

export async function GET(request: NextRequest) {
	const limit = request.nextUrl.searchParams.get("limit");
	if (limit !== null && (!/^\d+$/.test(limit) || Number(limit) < 1)) {
		return NextResponse.json(
			{ message: "랭킹 조회 인원은 1 이상의 정수여야 합니다." },
			{ status: 400 }
		);
	}

	const accessToken = await getRequestAccessToken(request);
	return proxyArcadeRequest({
		request,
		path: "/api/arcade/ranking",
		accessToken,
	});
}
