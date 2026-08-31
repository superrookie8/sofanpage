import { NextRequest, NextResponse } from "next/server";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";
import { proxyArcadeRequest } from "@/features/arcade/server/proxyArcadeRequest";

export async function GET(request: NextRequest) {
	const accessToken = await getRequestAccessToken(request);
	if (!accessToken) {
		return NextResponse.json(
			{ message: "로그인이 필요합니다." },
			{ status: 401 }
		);
	}

	return proxyArcadeRequest({
		request,
		path: "/api/arcade/my-score",
		accessToken,
	});
}
