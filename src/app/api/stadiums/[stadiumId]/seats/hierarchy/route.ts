import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ stadiumId: string }> }
) {
	try {
		const { stadiumId } = await params;
		// 경기장 ID를 그대로 사용 (인코딩/디코딩 불필요)
		const backendUrl = `${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/stadiums/${stadiumId}/seats/hierarchy`;
		
		console.log("API 라우트 - 경기장 ID:", stadiumId);
		console.log("API 라우트 - 백엔드 URL:", backendUrl);
		
		const response = await fetch(backendUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			cache: "no-store",
		});

		console.log("API 라우트 - 백엔드 응답 상태:", response.status, response.statusText);

		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch {
				errorData = { message: await response.text() };
			}
			console.error("API 라우트 - 백엔드 에러:", errorData);
			return NextResponse.json(
				{ message: errorData.message || "Failed to fetch seat hierarchy" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		console.log("API 라우트 - 백엔드 응답 데이터:", data);
		console.log("API 라우트 - zones 개수:", data?.zones?.length);
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}

