import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function POST(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	let body: unknown;
	try { body = await request.json(); } catch { return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 }); }
	return adminBackendFetch("/api/admin/videos/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
