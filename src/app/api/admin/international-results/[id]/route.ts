import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

type RouteContext = { params: Promise<{ id: string }> };

function missingId() {
	return NextResponse.json({ message: "국제대회 기록 ID가 필요합니다." }, { status: 400 });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const { id } = await params;
	if (!id) return missingId();

	return adminBackendFetch(`/api/admin/international-results/${encodeURIComponent(id)}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(await request.json()),
	});
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const { id } = await params;
	if (!id) return missingId();

	return adminBackendFetch(`/api/admin/international-results/${encodeURIComponent(id)}`, {
		method: "DELETE",
	});
}
