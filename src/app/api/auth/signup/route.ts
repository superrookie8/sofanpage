import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";

export async function POST(request: NextRequest) {
	try {
		const { nickname, password, passwordConfirm, email } = await request.json();

		if (password !== passwordConfirm) {
			return NextResponse.json(
				{ message: "비밀번호가 일치하지 않습니다." },
				{ status: 400 }
			);
		}

		const response = await serverAxiosService.post("/api/sign_up", {
			nickname,
			password,
			passwordConfirm,
			email,
		});

		return NextResponse.json(
			{ message: response.data.message || "회원가입 성공" },
			{ status: 201 }
		);
	} catch (error: any) {
		return NextResponse.json(
			{
				message:
					error.response?.data?.message || error.message || "회원가입 실패",
			},
			{ status: error.response?.status || 500 }
		);
	}
}
