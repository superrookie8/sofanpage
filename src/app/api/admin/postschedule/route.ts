import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { legacyScheduleRequest, toLegacySchedule } from "@/lib/admin/adapters";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function POST(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const body = await request.json();
	const id = typeof body?._id === "string" ? body._id : "";
	const response = await adminBackendFetch(`/api/admin/schedules${id ? `/${encodeURIComponent(id)}` : ""}`, {
		method: id ? "PUT" : "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(legacyScheduleRequest(body)),
	});
	if (!response.ok) return response;
	return NextResponse.json(toLegacySchedule(await response.json()), { status: response.status });
}
