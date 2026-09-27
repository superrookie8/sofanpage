import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";
type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Context) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const { id } = await params;
	if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return NextResponse.json({ message: "잘못된 영상 ID입니다." }, { status: 400 });
	let body: unknown;
	try { body = await request.json(); } catch { return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 }); }
	return adminBackendFetch(`/api/admin/videos/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
export async function DELETE(request: NextRequest, { params }: Context) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const { id } = await params;
	if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return NextResponse.json({ message: "잘못된 영상 ID입니다." }, { status: 400 });
	return adminBackendFetch(`/api/admin/videos/${id}`, { method: "DELETE" });
}
