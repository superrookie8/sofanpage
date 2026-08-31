import { NextResponse } from "next/server";

/** 사진은 이벤트 상세 응답의 `photos` presigned URL 배열에서 제공한다. */
export async function GET() {
	return NextResponse.json(
		{ message: "Event photos are available from /api/events/{eventId}." },
		{ status: 410 }
	);
}
