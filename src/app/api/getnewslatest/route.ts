import { NextResponse, NextRequest } from "next/server";

const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
	try {
		if (!process.env.NEXT_PUBLIC_BACKAPI_URL) {
			throw new Error("Backend API URL is not defined");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/latest`,
			{
				cache: isDevelopment ? "no-store" : "default",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			}
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		return NextResponse.json({
			success: true,
			data,
		});
	} catch (error) {
		console.error("API Error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch news data",
			},
			{ status: 500 }
		);
	}
}
