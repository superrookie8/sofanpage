import { NextResponse } from "next/server";
import { resolveBackendApiUrl } from "@/lib/server/http/backendApi";

export async function GET() {
	try {
		const response = await fetch(
			`${resolveBackendApiUrl()}/api/international-results`,
			{
				method: "GET",
				headers: { Accept: "application/json" },
				cache: "no-store",
			}
		);

		if (!response.ok) {
			return NextResponse.json(
				{ message: "Failed to fetch international results." },
				{ status: response.status }
			);
		}

		const data: unknown = await response.json();
		if (!Array.isArray(data)) {
			return NextResponse.json(
				{ message: "Invalid international results response." },
				{ status: 502 }
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("International results proxy failed:", error);
		return NextResponse.json(
			{ message: "International results are temporarily unavailable." },
			{ status: 502 }
		);
	}
}
