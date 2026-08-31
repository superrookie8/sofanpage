import { NextResponse } from "next/server";

export async function POST() {
	return NextResponse.json(
		{ message: "Password login is not available." },
		{ status: 404 }
	);
}
