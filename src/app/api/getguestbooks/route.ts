import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/get_guestbook_entries`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch guestbook entries");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
