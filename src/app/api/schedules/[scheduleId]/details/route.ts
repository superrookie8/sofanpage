import { NextRequest, NextResponse } from "next/server";

const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ scheduleId: string }> }
) {
	try {
		const { scheduleId } = await params;

		if (!scheduleId) {
			return NextResponse.json(
				{ message: "Schedule ID is required" },
				{ status: 400 }
			);
		}

		const backendUrl = `${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/schedules/${scheduleId}/details`;

		const headers: HeadersInit = {
			"Content-Type": "application/json",
		};

		const backendResponse = await fetch(backendUrl, {
			method: "GET",
			headers,
			cache: isDevelopment ? "no-store" : "default",
		});

		if (!backendResponse.ok) {
			let errorMessage = "Failed to get schedule details.";
			try {
				const errorData = await backendResponse.json();
				errorMessage = errorData.message || errorMessage;
			} catch {
				errorMessage = `Backend returned ${backendResponse.status}: ${backendResponse.statusText}`;
			}
			console.error(
				"Backend error:",
				errorMessage,
				"Status:",
				backendResponse.status
			);
			return NextResponse.json(
				{ message: errorMessage },
				{ status: backendResponse.status }
			);
		}

		const backendData = await backendResponse.json();

		const response = NextResponse.json(backendData, { status: 200 });
		// 캐싱 헤더
		// - 개발 환경: gameId 반영/디버깅을 위해 캐시 금지
		// - 운영 환경: 10분 캐시
		if (isDevelopment) {
			response.headers.set("Cache-Control", "no-store");
		} else {
			response.headers.set(
				"Cache-Control",
				"public, s-maxage=600, stale-while-revalidate=300"
			);
		}

		return response;
	} catch (error: any) {
		console.error("Error fetching schedule details:", error);
		return NextResponse.json(
			{ message: error.message || "Internal server error" },
			{ status: 500 }
		);
	}
}
