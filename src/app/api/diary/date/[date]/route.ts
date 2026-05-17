import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ date: string }> }
) {
	try {
		const token = await getRequestAccessToken(req);
		if (!token) {
			return NextResponse.json(
				{ message: "인증이 필요합니다" },
				{ status: 401 }
			);
		}

		const { date } = await params;

		const response = await serverAxiosService.get(
			`/api/diary/date/${date}`,
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
