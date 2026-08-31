import { NextRequest, NextResponse } from "next/server";
import { backendLogin, clientErrorMessage } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";
import { setAdminSession } from "@/lib/admin/session";

export async function POST(req: NextRequest) {
	const rejected = rejectCrossOriginMutation(req);
	if (rejected) return rejected;

	try {
		const { username, password } = (await req.json()) as Record<string, unknown>;
		if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
			return NextResponse.json({ message: "아이디와 비밀번호를 입력해 주세요." }, { status: 400 });
		}

		const { response: backendResponse, body: backendData } = await backendLogin({ username, password });

		if (!backendResponse.ok) {
			return NextResponse.json(
				{ message: clientErrorMessage(backendData, "로그인에 실패했습니다.") },
				{ status: backendResponse.status }
			);
		}

		const token = backendData?.token;
		if (typeof token !== "string" || !token) {
			return NextResponse.json(
				{ message: "서버로부터 토큰을 받지 못했습니다." },
				{ status: 502 }
			);
		}

		const response = NextResponse.json(
			{ authenticated: true, username: backendData.username, role: backendData.role },
			{ status: 200 }
		);
		setAdminSession(response, token);
		return response;
	} catch (error) {
		return NextResponse.json(
			{ message: error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다." },
			{ status: 502 }
		);
	}
}
