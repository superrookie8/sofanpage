import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";
import { resolveBackendApiUrl } from "@/lib/server/http/backendApi";

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

export async function PUT(request: NextRequest) {
	const token = await getRequestAccessToken(request);
	if (!token) {
		return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const response = await fetch(
			`${resolveBackendApiUrl()}/api/put/userinfo`,
			{
				method: "PUT",
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
				cache: "no-store",
			}
		);

		if (!response.ok) {
			return NextResponse.json(
				{ message: "사용자 정보 수정 실패" },
				{ status: response.status }
			);
		}

		return NextResponse.json(await response.json(), { status: 200 });
	} catch {
		return NextResponse.json(
			{ message: "사용자 정보 수정 실패" },
			{ status: 502 }
		);
	}
}
