import { NextRequest, NextResponse } from "next/server";

// const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get("page") || "1", 10);
		const pageSize = parseInt(searchParams.get("page_size") || "10", 10);
		const user = searchParams.get("user");

		let url = `${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/get_user_guestbook_entries?page=${page}&page_size=${pageSize}`;
		if (user) {
			url += `&user=${user}`;
		}

		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error("Failed to fetch guestbook entries");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
