import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	if (request.method === "POST") {
		const { nickname, password, passwordConfirm } = await request.json();

		if (password !== passwordConfirm) {
			return new NextResponse(
				JSON.stringify({ message: "비밀번호가 일치하지 않습니다." }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		try {
			const backendResponse = await fetch("http://127.0.0.1:5000/api/sign_up", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ nickname, password, passwordConfirm }),
			});

			const backendData = await backendResponse.json();
			if (!backendResponse.ok) {
				throw new Error(backendData.message || "백엔드 서버로부터 에러 응답");
			}

			return new NextResponse(
				JSON.stringify({ message: backendData.message }),
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
