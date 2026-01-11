// src/app/api/auth/check-nickname/route.ts
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const requestBody = await request.json();
		const nickname = requestBody.nickname;

		const flaskResponse = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/nickname_check`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ nickname }),
			}
		);

		const data = await flaskResponse.json();
		return NextResponse.json(data, { status: flaskResponse.status });
	} catch (error) {
		return NextResponse.json(
			{ msg: "서버 오류가 발생했습니다" },
			{ status: 500 }
		);
	}
}
