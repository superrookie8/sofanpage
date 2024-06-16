import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { username, password } = await req.json();

		const backendResponse = await fetch(
			"http://127.0.0.1:5000/api/admin/login",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			}
		);

		const backendData = await backendResponse.json();

		if (!backendResponse.ok) {
			throw new Error(backendData.msg || "로그인에 실패했습니다.");
		}

		const token = backendData.access_token;
		if (!token) {
			throw new Error("서버로부터 토큰을 받지 못했습니다.");
		}

		return NextResponse.json({ access_token: token }, { status: 200 });
	} catch (error: any) {
		return new NextResponse(JSON.stringify({ message: error.message }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}
