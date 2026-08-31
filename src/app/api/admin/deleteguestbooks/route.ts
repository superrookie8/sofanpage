import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function DELETE(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const id = request.nextUrl.searchParams.get("entry_id");
	if (!id) return NextResponse.json({ message: "entry_id가 필요합니다." }, { status: 400 });
	return adminBackendFetch(`/api/admin/guestbooks/${encodeURIComponent(id)}`, { method: "DELETE" });
}
