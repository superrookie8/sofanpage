import { NextRequest, NextResponse } from "next/server";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";
import { resolveBackendApiUrl } from "@/lib/server/http/backendApi";

export async function POST(request: NextRequest) {
	const token = await getRequestAccessToken(request);
	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const response = await fetch(
			`${resolveBackendApiUrl()}/api/images/upload/multiple`,
			{
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
				cache: "no-store",
			}
		);

		if (!response.ok) {
			return NextResponse.json(
				{ message: "Failed to upload images" },
				{ status: response.status }
			);
		}

		return NextResponse.json(await response.json(), { status: 200 });
	} catch {
		return NextResponse.json(
			{ message: "Failed to upload images" },
			{ status: 502 }
		);
	}
}
