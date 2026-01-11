// src/app/api/auth/check-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json(
				{ message: "이메일이 필요합니다.", exists: false },
				{ status: 400 }
			);
		}

		const response = await serverAxiosService.get(
			`/api/users/check-email?email=${encodeURIComponent(email)}`
		);

		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		// 백엔드에서 이메일이 존재하지 않으면 404가 올 수 있으므로 처리
		if (error.response?.status === 404) {
			return NextResponse.json({ exists: false }, { status: 200 });
		}

		return NextResponse.json(
			{
				message:
					error.response?.data?.message ||
					"이메일 확인 중 오류가 발생했습니다.",
				exists: false,
			},
			{ status: error.response?.status || 500 }
		);
	}
}
