import { NextRequest, NextResponse } from "next/server";

const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const eventId = searchParams.get("id");

	if (!eventId) {
		return NextResponse.json(
			{ message: "Event ID is required" },
			{ status: 400 }
		);
	}

	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/get/event-detail/${eventId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store",
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to fetch event details.");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching event details:", error.message);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
