import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	if (request.method === "POST") {
		const { username, password } = await request.json();

		try {
			const backendResponse = await fetch("http://127.0.0.1:5000/api/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			const backendData = await backendResponse.json();
			if (!backendResponse.ok) {
				throw new Error(backendData.message || "로그인에 실패했습니다.");
			}

			// 백엔드에서 로그인 성공 응답을 받으면 클라이언트에도 성공 메시지 전송
			return new NextResponse(
				JSON.stringify({ message: "로그인 성공!", user: backendData.user }),
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		} catch (error: any) {
			return new NextResponse(JSON.stringify({ message: error.message }), {
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}
	} else {
		return new NextResponse(null, {
			status: 405,
			headers: {
				Allow: "POST",
			},
		});
	}
}
