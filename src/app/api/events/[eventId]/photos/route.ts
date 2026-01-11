import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ eventId: string }> }
) {
	try {
		const { eventId } = await params;
		const { searchParams } = new URL(req.url);
		const page = searchParams.get("page") || "1";
		const pageSize = searchParams.get("page_size") || "5";

		// serverAxiosService를 사용하여 세션 토큰 자동 포함
		const response = await serverAxiosService.get(`/api/events/${eventId}`, {
			params: {
				page,
				page_size: pageSize,
			},
		});

		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		if (error.response?.status === 401) {
			return NextResponse.json(
				{ message: "인증이 필요합니다" },
				{ status: 401 }
			);
		}
		console.error("Error fetching event photos:", error.message);
		return NextResponse.json(
			{
				message:
					error.response?.data?.message ||
					error.message ||
					"이벤트 사진 조회 실패",
			},
			{ status: error.response?.status || 500 }
		);
	}
}
