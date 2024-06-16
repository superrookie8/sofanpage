import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
	try {
		const { photoIds } = await req.json();
		const token = req.headers.get("authorization") || "";

		const response = await fetch(
			"http://127.0.0.1:5000/api/admin/deletephoto",
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
				body: JSON.stringify({ photoIds }),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to delete photos.");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error("Error deleting photos:", error);
		return NextResponse.json(
			{ message: error.message || "Failed to delete photos" },
			{ status: 500 }
		);
	}
}
