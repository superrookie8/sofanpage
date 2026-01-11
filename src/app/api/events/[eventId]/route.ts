import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ eventId: string }> }
) {
	try {
		const { eventId } = await params;

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/events/${eventId}`,
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
