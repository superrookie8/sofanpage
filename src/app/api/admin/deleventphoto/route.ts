import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function DELETE(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const { eventId, photoKey } = await request.json() as { eventId?: string; photoKey?: string };
	if (!eventId || !photoKey) return NextResponse.json({ message: "eventId와 photoKey가 필요합니다." }, { status: 400 });
	return adminBackendFetch(`/api/admin/events/${encodeURIComponent(eventId)}/photos?photoKey=${encodeURIComponent(photoKey)}`, { method: "DELETE" });
}
