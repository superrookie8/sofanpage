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

export async function DELETE(request: NextRequest) {
	const origin = request.headers.get("origin");
	if (!origin || origin !== request.nextUrl.origin) {
		return NextResponse.json({ message: "허용되지 않은 요청입니다" }, { status: 403 });
	}

	const token = await getRequestAccessToken(request);
	if (!token) {
		return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ message: "확인 문구를 입력해 주세요" }, { status: 400 });
	}
	if (
		typeof body !== "object" ||
		body === null ||
		(body as Record<string, unknown>).confirmation !== "회원 탈퇴"
	) {
		return NextResponse.json({ message: "확인 문구를 정확히 입력해 주세요" }, { status: 400 });
	}

	try {
		await serverAxiosService.delete(
			"/api/users/me",
			{ data: { confirmation: "회원 탈퇴" } },
			token
		);
		return NextResponse.json({ deleted: true }, { status: 200 });
	} catch (error: any) {
		const upstreamStatus = error.response?.status;
		if (upstreamStatus === 400 || upstreamStatus === 401 || upstreamStatus === 412) {
			return NextResponse.json(
				{ message: upstreamStatus === 412 ? "소셜 계정 재인증이 필요합니다" : "회원 탈퇴 요청을 확인해 주세요" },
				{ status: upstreamStatus }
			);
		}
		// backend가 아직 새 DELETE 계약을 배포하지 않은 경우에도 사용자에게 404를 노출하지 않는다.
		const status = upstreamStatus === 404 || upstreamStatus === 405 ? 503 : 503;
		return NextResponse.json(
			{ message: "회원 탈퇴 기능을 준비하고 있습니다" },
			{ status }
		);
	}
}
