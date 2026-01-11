import { NextRequest, NextResponse } from "next/server";

const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const start = searchParams.get("start");
		const end = searchParams.get("end");

		// 백엔드 API URL 구성
		let backendUrl = `${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/schedules`;
		
		// 쿼리 파라미터가 있으면 추가
		const params = new URLSearchParams();
		if (start) params.append("start", start);
		if (end) params.append("end", end);
		
		if (params.toString()) {
			backendUrl += `?${params.toString()}`;
		}

		const backendResponse = await fetch(backendUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			cache: isDevelopment ? "no-store" : "default",
		});

		const backendData = await backendResponse.json();

		if (!backendResponse.ok) {
			throw new Error(backendData.message || "Failed to get schedules.");
		}

		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
