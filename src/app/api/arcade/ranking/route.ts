import { NextRequest, NextResponse } from "next/server";
import { getOptionalRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";
import { proxyArcadeRequest } from "@/features/arcade/server/proxyArcadeRequest";
import { sanitizeRankingResponse } from "@/features/arcade/server/sanitizeRanking";

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
		// 비로그인에도 열린 엔드포인트다. userId·profileImageUrl을 흘리지 않는다.
		sanitizeJson: sanitizeRankingResponse,
	});
}
