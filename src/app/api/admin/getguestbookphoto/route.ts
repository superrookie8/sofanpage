import { NextRequest, NextResponse } from "next/server";
import { adminBackendBinaryFetch } from "@/lib/admin/backend";

export async function GET(request: NextRequest) {
	const id = request.nextUrl.searchParams.get("entry_id");
	if (!id) return NextResponse.json({ message: "entry_id가 필요합니다." }, { status: 400 });
	return adminBackendBinaryFetch(`/api/admin/guestbooks/${encodeURIComponent(id)}/photo`);
}
