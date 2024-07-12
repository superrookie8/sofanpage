import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const page = url.searchParams.get("page") || "1";
		const pageSize = url.searchParams.get("page_size") || "10";

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/get/photos?page=${page}&page_size=${pageSize}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Pragma: "no-cache",
					"Cache-Control": "no-cache, no-store, must-revalidate",
				},
				cache: "no-store",
			}
		);

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.message || "Failed to fetch photos.");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching photos:", error);
		return NextResponse.json(
			{ message: error.message || "Failed to fetch photos" },
			{ status: 500 }
		);
	}
}

export const dynamic = "force-dynamic";
