import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { canonicalEventUpdateFormData, EventFormValidationError } from "@/lib/admin/events";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	if (!params.id) {
		return NextResponse.json({ message: "event id가 필요합니다." }, { status: 400 });
	}
	if (!(request.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
		return NextResponse.json({ message: "multipart/form-data 요청이 필요합니다." }, { status: 400 });
	}

	let body: FormData;
	try {
		body = canonicalEventUpdateFormData(await request.formData());
	} catch (error) {
		return NextResponse.json({
			message: error instanceof EventFormValidationError
				? error.message
				: "이벤트 수정 요청을 읽을 수 없습니다.",
		}, { status: 400 });
	}

	return adminBackendFetch(`/api/admin/events/${encodeURIComponent(params.id)}`, {
		method: "PUT",
		body,
	});
}
