import { NextRequest, NextResponse } from "next/server";
import { getOptionalRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";
import { proxyArcadeRequest } from "@/features/arcade/server/proxyArcadeRequest";

export async function GET(request: NextRequest) {
	const limit = request.nextUrl.searchParams.get("limit");
	if (
		limit !== null &&
		(!/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 100)
	) {
		return NextResponse.json(
			{ message: "랭킹 조회 인원은 1 이상 100 이하의 정수여야 합니다." },
			{ status: 400 }
		);
	}

	const accessToken = await getOptionalRequestAccessToken(request);
	return proxyArcadeRequest({
		request,
		path: "/api/arcade/ranking",
		accessToken,
	});
}
