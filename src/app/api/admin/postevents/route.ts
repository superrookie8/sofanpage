import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import {
	canonicalEventFormData,
	EventFormValidationError,
	safeEventErrorMessage,
} from "@/lib/admin/events";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function POST(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	if (!(request.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
		return NextResponse.json({ message: "multipart/form-data 요청이 필요합니다." }, { status: 400 });
	}
	let body: FormData;
	try {
		body = canonicalEventFormData(await request.formData());
	} catch (error) {
		if (error instanceof EventFormValidationError) {
			return NextResponse.json({ message: error.message }, { status: 400 });
		}
		throw error;
	}
	const response = await adminBackendFetch("/api/admin/events", { method: "POST", body });
	if (response.ok || response.status !== 400) return response;
	const upstream = await response.json().catch(() => null);
	return NextResponse.json({
		message: safeEventErrorMessage(
			upstream,
			"이벤트 입력과 사진을 확인해 주세요. 사진은 JPG, JPEG, PNG, GIF, WEBP 형식이며 파일당 5MB 이하여야 합니다."
		),
	}, { status: 400 });
}
