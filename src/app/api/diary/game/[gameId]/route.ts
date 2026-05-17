import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ gameId: string }> }
) {
	try {
		const token = await getRequestAccessToken(req);
		if (!token) {
			return NextResponse.json(
				{ message: "인증이 필요합니다" },
				{ status: 401 }
			);
		}

		const { gameId } = await params;

		const response = await serverAxiosService.get(
			`/api/diary/game/${gameId}`,
			undefined,
			token
		);
		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		if (error.response?.status === 401) {
			return NextResponse.json(
				{ message: "인증이 필요합니다" },
				{ status: 401 }
			);
		}
		// 백엔드: 일지 없음을 404로 주는 경우 → 존재하지 않음으로 정규화
		if (error.response?.status === 404) {
			return NextResponse.json(
				{ exists: false, diaryId: null, diary: null },
				{ status: 200 }
			);
		}
		return NextResponse.json(
			{
				message:
					error.response?.data?.message ||
					error.message ||
					"일지 조회 실패",
			},
			{ status: error.response?.status || 500 }
		);
	}
}
