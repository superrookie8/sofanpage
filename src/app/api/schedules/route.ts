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

		if (isDevelopment) {
			console.log("백엔드 API 호출:", {
				url: backendUrl,
				start,
				end,
				backendUrlEnv: process.env.NEXT_PUBLIC_BACKAPI_URL,
			});
		}

		const backendResponse = await fetch(backendUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			cache: isDevelopment ? "no-store" : "default",
		});

		// 백엔드 응답 상태 확인
		if (!backendResponse.ok) {
			const errorData = await backendResponse.json().catch(() => ({}));
			console.error("백엔드 API 오류:", {
				status: backendResponse.status,
				statusText: backendResponse.statusText,
				url: backendUrl,
				error: errorData,
			});
			return NextResponse.json(
				{
					message: errorData.message || "Failed to get schedules.",
					error: errorData,
				},
				{ status: backendResponse.status }
			);
		}

		const backendData = await backendResponse.json();

		if (isDevelopment) {
			console.log("백엔드 응답 데이터:", {
				isArray: Array.isArray(backendData),
				dataType: typeof backendData,
				dataLength: Array.isArray(backendData) ? backendData.length : "N/A",
			});
		} else {
			// 배포 환경에서도 최소한의 로그 (문제 진단용)
			if (!Array.isArray(backendData)) {
				console.error("백엔드 응답이 배열이 아닙니다:", {
					dataType: typeof backendData,
					url: backendUrl,
				});
			}
		}

		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("스케줄 API 오류:", {
			message: error.message,
			stack: error.stack,
			error,
		});
		return NextResponse.json(
			{
				message: error.message || "Internal server error",
				error: isDevelopment ? error.stack : undefined,
			},
			{ status: 500 }
		);
	}
}
