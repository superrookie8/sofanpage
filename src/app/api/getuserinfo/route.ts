import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const token = req.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/user_info`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch user info");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json({ message: error.message }, { status: 500 });
		} else {
			return NextResponse.json(
				{ message: "An unknown error occurred" },
				{ status: 500 }
			);
		}
	}
}
