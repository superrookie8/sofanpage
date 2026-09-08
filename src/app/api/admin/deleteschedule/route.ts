import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function DELETE(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const { _id } = await request.json() as { _id?: string };
	if (!_id) return NextResponse.json({ message: "_id가 필요합니다." }, { status: 400 });
	return adminBackendFetch(`/api/admin/schedules/${encodeURIComponent(_id)}`, { method: "DELETE" });
}
