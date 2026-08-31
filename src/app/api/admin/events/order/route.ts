import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { canonicalEventOrderBody, EventFormValidationError } from "@/lib/admin/events";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function PUT(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;

	let body: { eventIds: string[] };
	try {
		body = canonicalEventOrderBody(await request.json());
	} catch (error) {
		return NextResponse.json({
			message: error instanceof EventFormValidationError
				? error.message
				: "이벤트 순서 요청을 읽을 수 없습니다.",
		}, { status: 400 });
	}

	return adminBackendFetch("/api/admin/events/order", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
}
