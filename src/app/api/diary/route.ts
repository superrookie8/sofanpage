import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";

// GET: 일지 목록 조회
export async function GET(req: NextRequest) {
	try {
		const token = await getRequestAccessToken(req);
		if (!token) {
			return NextResponse.json(
				{ message: "인증이 필요합니다" },
				{ status: 401 }
			);
		}

		const response = await serverAxiosService.get("/api/diary", undefined, token);
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
					"일지 목록 조회 실패",
			},
			{ status: error.response?.status || 500 }
		);
	}
}

// POST: 일지 생성
export async function POST(req: NextRequest) {
	try {
		const token = await getRequestAccessToken(req);
		if (!token) {
			return NextResponse.json(
				{ message: "인증이 필요합니다" },
				{ status: 401 }
			);
		}

		const body = await req.json();
		const response = await serverAxiosService.post(
			"/api/diary",
			body,
			undefined,
			token
		);
		return NextResponse.json(response.data, { status: 201 });
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
					"일지 생성 실패",
			},
			{ status: error.response?.status || 500 }
		);
	}
}
