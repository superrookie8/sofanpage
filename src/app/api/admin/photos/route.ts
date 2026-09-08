import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { normalizePhotoIds, toAdminPhotoGroups } from "@/lib/admin/adapters";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function GET() {
	const response = await adminBackendFetch("/api/admin/photos");
	if (!response.ok) return response;
	return NextResponse.json(toAdminPhotoGroups(await response.json()));
}

export async function POST(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const contentType = request.headers.get("content-type") ?? "";
	if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
		return NextResponse.json({ message: "사진 파일 형식의 요청이 필요합니다." }, { status: 400 });
	}
	const input = await request.formData();
	const photos = input.getAll("photos").filter((value): value is File => value instanceof File);
	if (photos.length === 0) {
		return NextResponse.json({ message: "업로드할 사진을 선택해 주세요." }, { status: 400 });
	}
	const formData = new FormData();
	for (const photo of photos) formData.append("photos", photo, photo.name);
	return adminBackendFetch("/api/admin/photos", { method: "POST", body: formData });
}

export async function DELETE(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const input = await request.json() as { photoIds?: unknown };
	const photoIds = normalizePhotoIds(input.photoIds);
	if (photoIds.length === 0) {
		return NextResponse.json({ message: "삭제할 사진을 선택해 주세요." }, { status: 400 });
	}
	return adminBackendFetch("/api/admin/photos", {
		method: "DELETE",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ photoIds }),
	});
}
