import { NextResponse, NextRequest } from "next/server";

const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/rookie/search?q=이소희`,
		{
			cache: "no-store",
		}
	);
	const data = await res.json();

	return NextResponse.json(data);
}
