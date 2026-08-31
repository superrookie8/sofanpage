import { NextRequest, NextResponse } from "next/server";
import { resolveBackendApiUrl } from "@/lib/server/http/backendApi";

export async function GET(req: NextRequest) {
	try {
		const response = await fetch(
			`${resolveBackendApiUrl()}/api/stadiums`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store",
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to fetch stadiums");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}

