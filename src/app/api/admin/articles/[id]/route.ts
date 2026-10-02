import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";
type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Context) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const { id } = await params;
	if (!/^[0-9a-f]{24}$/.test(id)) return NextResponse.json({ message: "잘못된 기사 ID입니다." }, { status: 400 });
	return adminBackendFetch(`/api/admin/articles/${id}`, { method: "DELETE" });
}
