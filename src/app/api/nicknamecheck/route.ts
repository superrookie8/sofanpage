// /app/api/nickname-check.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
		return new Response(JSON.stringify(data), {
			status: flaskResponse.status,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		return new Response(JSON.stringify({ msg: "서버 오류가 발생했습니다" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}
