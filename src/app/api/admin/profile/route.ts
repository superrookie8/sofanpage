import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { legacyProfileRequest, toLegacyProfile } from "@/lib/admin/adapters";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function PUT(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const input = await request.json();
	const response = await adminBackendFetch("/api/admin/profile", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(legacyProfileRequest(input)),
	});
	if (!response.ok) return response;
	return NextResponse.json(toLegacyProfile(await response.json()));
}
