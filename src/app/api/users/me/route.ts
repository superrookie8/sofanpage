import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";

// GET: 현재 사용자 정보 조회
export async function GET(req: NextRequest) {
	try {
		const response = await serverAxiosService.get("/api/users/me");
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
					"사용자 정보 조회 실패",
			},
			{ status: error.response?.status || 500 }
		);
	}
}

// PUT: 현재 사용자 정보 수정
export async function PUT(req: NextRequest) {
	try {
		const formData = await req.formData();
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/put/userinfo`,
			{
				method: "PUT",
				headers: {
					Authorization: req.headers.get("Authorization") || "",
				},
				body: formData,
				cache: "no-store",
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "사용자 정보 수정 실패");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		if (error.message.includes("Unauthorized")) {
			return NextResponse.json(
				{ message: "인증이 필요합니다" },
				{ status: 401 }
			);
		}
		return NextResponse.json(
			{
				message: error.message || "사용자 정보 수정 실패",
			},
			{ status: 500 }
		);
	}
}
