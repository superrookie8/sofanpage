import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const backendResponse = await fetch("http://localhost:5000/api/get_stats", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!backendResponse.ok) {
			const errorText = await backendResponse.text();
			console.error("Backend response error:", errorText);
			throw new Error("Failed to fetch stats from backend");
		}

		const backendData = await backendResponse.json();
		console.log("Fetched data from backend:", backendData);

		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
