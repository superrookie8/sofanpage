import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/articles/latest`,
			{
				cache: "no-store",
			}
		);

		if (!res.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch latest news" },
				{ status: res.status }
			);
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching latest news:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
