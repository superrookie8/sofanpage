import { NextRequest, NextResponse } from "next/server";
import { resolveBackendApiUrl } from "@/lib/server/http/backendApi";

const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
	try {
		const backendResponse = await fetch(
			`${resolveBackendApiUrl()}/api/get_schedules`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: isDevelopment ? "no-store" : "default",
			}
		);

		const backendData = await backendResponse.json();

		if (!backendResponse.ok) {
			throw new Error(backendData.message || "Failed to get schedule.");
		}
		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
