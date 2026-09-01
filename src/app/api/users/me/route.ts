import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";

export async function GET(request: NextRequest) {
	const token = await getRequestAccessToken(request);
	if (!token) {
		return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
	}

	try {
		const response = await serverAxiosService.get(
			"/api/users/me",
			undefined,
			token
		);
		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: error.response?.data?.message || "사용자 정보 조회 실패" },
			{ status: error.response?.status || 500 }
		);
	}
}

export async function PATCH(request: NextRequest) {
	const token = await getRequestAccessToken(request);
	if (!token) {
		return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ message: "요청 형식이 올바르지 않습니다" },
			{ status: 400 }
		);
	}

	// 이미지 파일은 /api/images/upload로 먼저 올리고 그 키만 여기로 보낸다.
	const draft = (body ?? {}) as Record<string, unknown>;
	const payload: Record<string, string> = {};
	if (typeof draft.nickname === "string") payload.nickname = draft.nickname;
	if (typeof draft.profileImageUrl === "string") {
		payload.profileImageUrl = draft.profileImageUrl;
	}
	if (Object.keys(payload).length === 0) {
		return NextResponse.json(
			{ message: "변경할 내용이 없습니다" },
			{ status: 400 }
		);
	}

	try {
		const response = await serverAxiosService.patch(
			"/api/users/me",
			payload,
			undefined,
			token
		);
		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: error.response?.data?.message || "사용자 정보 수정 실패" },
			{ status: error.response?.status || 502 }
		);
	}
}
