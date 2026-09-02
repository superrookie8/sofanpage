import { NextRequest, NextResponse } from "next/server";
import { adminBackendBinaryFetch } from "@/lib/admin/backend";

export async function GET(
	_request: NextRequest,
	context: { params: Promise<{ id: string }> }
) {
	const { id } = await context.params;
	if (!id) return NextResponse.json({ message: "사진 ID가 필요합니다." }, { status: 400 });
	return adminBackendBinaryFetch(`/api/admin/photos/${encodeURIComponent(id)}/content`);
}
