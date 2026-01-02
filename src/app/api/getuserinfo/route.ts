import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const token = req.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/users/me`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				cache: "no-store", // 캐시 방지
			}
		);

		if (response.status === 401) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		if (!response.ok) {
			throw new Error("Failed to fetch user info");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		let errorMessage = "An unknown error occurred";
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error("Error fetching user info:", errorMessage);
		return NextResponse.json({ message: errorMessage }, { status: 500 });
	}
}
