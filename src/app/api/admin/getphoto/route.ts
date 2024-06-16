import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const token = req.headers.get("authorization") || "";

		const response = await fetch("http://127.0.0.1:5000/api/admin/get/photos", {
			method: "GET",
			headers: {
				Authorization: token,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.message || "Failed to fetch photos.");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching photos:", error);
		return NextResponse.json(
			{ message: error.message || "Failed to fetch photos" },
			{ status: 500 }
		);
	}
}
