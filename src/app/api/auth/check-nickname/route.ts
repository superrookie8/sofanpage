import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";

/**
 * 닉네임 사용 가능 여부 확인. 본인이 이미 쓰는 닉네임은 사용 가능으로 응답한다.
 * 백엔드가 로그인한 사용자만 조회할 수 있게 막아 두어 token을 함께 보낸다.
 */
export async function GET(request: NextRequest) {
	const token = await getRequestAccessToken(request);
	if (!token) {
		return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
	}

	const nickname = request.nextUrl.searchParams.get("nickname")?.trim() ?? "";
	if (!nickname) {
		return NextResponse.json(
			{ message: "닉네임을 입력해 주세요" },
			{ status: 400 }
		);
	}

	try {
		const response = await serverAxiosService.get(
			`/api/users/check-nickname?nickname=${encodeURIComponent(nickname)}`,
			undefined,
			token
		);
		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: error.response?.data?.message || "닉네임 확인에 실패했습니다" },
			{ status: error.response?.status || 502 }
		);
	}
}
