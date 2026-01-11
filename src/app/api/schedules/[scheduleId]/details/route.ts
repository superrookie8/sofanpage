import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";

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

		// 세션에서 토큰 가져오기 (있으면 포함, 없으면 null)
		const session = await getServerSession(authOptions);
		const token = session?.accessToken;

		const backendUrl = `${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/schedules/${scheduleId}/details`;
		
		const headers: HeadersInit = {
			"Content-Type": "application/json",
		};

		// 토큰이 있으면 Authorization 헤더 추가
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

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
			console.error("Backend error:", errorMessage, "Status:", backendResponse.status);
			return NextResponse.json(
				{ message: errorMessage },
				{ status: backendResponse.status }
			);
		}

		const backendData = await backendResponse.json();
		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching schedule details:", error);
		return NextResponse.json(
			{ message: error.message || "Internal server error" },
			{ status: 500 }
		);
	}
}
