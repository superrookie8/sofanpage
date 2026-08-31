import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({ message: "Profile API is not configured." }, { status: 501 });
}
