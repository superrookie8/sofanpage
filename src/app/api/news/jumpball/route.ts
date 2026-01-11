import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const page = searchParams.get("page") || "0";
		const limit = searchParams.get("limit") || "10";

		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/articles/jumpball?page=${page}&limit=${limit}`,
			{
				cache: "no-store",
			}
		);

		if (!res.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch jumpball news" },
				{ status: res.status }
			);
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching jumpball news:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
