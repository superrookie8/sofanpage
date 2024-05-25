import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const token = req.headers.get("authorization");

		if (!token) {
			throw new Error("Authorization header missing");
		}

		const backendResponse = await fetch(
			"http://127.0.0.1:5000/api/admin/get/profile",
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token, // Add Authorization header
				},
			}
		);

		const backendData = await backendResponse.json();
		console.log("backendData", backendData);

		if (!backendResponse.ok) {
			throw new Error(backendData.message || "Failed to get profile.");
		}

		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
