import { NextRequest, NextResponse } from "next/server";

const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/get_guestbook_entries`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: isDevelopment ? "no-store" : "default",
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch guestbook entries");
		}

		const data = await response.json();
		return new NextResponse(JSON.stringify(data), {
			status: 200,
		});
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
