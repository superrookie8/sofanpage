import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function DELETE(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const { eventId } = await request.json() as { eventId?: string };
	if (!eventId) return NextResponse.json({ message: "eventId가 필요합니다." }, { status: 400 });
	return adminBackendFetch(`/api/admin/events/${encodeURIComponent(eventId)}`, { method: "DELETE" });
}
