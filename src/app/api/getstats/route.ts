import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const backendResponse = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/playerstat/all`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store",
			}
		);

		if (!backendResponse.ok) {
			const errorData = await backendResponse.json();
			throw new Error(errorData.message || "Failed to fetch stats from backend");
		}

		const backendData = await backendResponse.json();
		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error during GET request:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
