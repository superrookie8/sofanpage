import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const nickname = searchParams.get("nickname");

		// 기본 URL 설정
		let url = `${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/user_stats`;

		// nickname이 있을 경우에만 쿼리 파라미터에 추가
		if (nickname) {
			url += `?nickname=${encodeURIComponent(nickname)}`;
		}

		// 백엔드 API 호출
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			cache: "no-store", // 캐시 방지
		});

		if (!response.ok) {
			throw new Error("Failed to fetch user stats");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{
				message: error.message || "통계 조회 실패",
			},
			{ status: 500 }
		);
	}
}
