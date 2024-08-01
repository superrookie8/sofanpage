import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		console.log("Starting GET request to backend");

		const backendResponse = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/get/stats`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const backendText = await backendResponse.text();

		if (!backendResponse.ok) {
			throw new Error("Failed to fetch stats from backend");
		}

		const backendData = JSON.parse(backendText);

		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error during GET request:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
