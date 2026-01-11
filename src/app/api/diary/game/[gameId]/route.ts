import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ gameId: string }> }
) {
	try {
		const { gameId } = await params;

		const response = await serverAxiosService.get(`/api/diary/game/${gameId}`);
		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		if (error.response?.status === 404) {
			// 해당 경기에 대한 일지가 없음
			return NextResponse.json(null, { status: 200 });
		}
		if (error.response?.status === 401) {
			return NextResponse.json(
				{ message: "인증이 필요합니다" },
				{ status: 401 }
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
