import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const token = req.headers.get("authorization");

		if (!token) {
			throw new Error("Authorization header missing");
		}

		const backendResponse = await fetch(
			"http://127.0.0.1:5000/api/admin/create_update_stats",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
				body: JSON.stringify(await req.json()),
			}
		);

		const backendData = await backendResponse.json();

		if (!backendResponse.ok) {
			throw new Error(backendData.error || "Failed to save stats data.");
		}

		return NextResponse.json(
			{ message: "Stats saved successfully!" },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
