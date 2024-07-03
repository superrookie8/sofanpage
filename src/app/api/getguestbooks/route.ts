import { NextRequest, NextResponse } from "next/server";

const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const page = searchParams.get("page") || "1";
		const pageSize = searchParams.get("page_size") || "10";
		const user = searchParams.get("user") || "";

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/get_guestbook_entries?user=${user}&page=${page}&page_size=${pageSize}`,
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
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
