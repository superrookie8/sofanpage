import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";

// GET: 일지 상세 조회
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ diaryId: string }> }
) {
	try {
		const { diaryId } = await params;
		const response = await serverAxiosService.get(`/api/diary/${diaryId}`);
		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		if (error.response?.status === 404) {
			return NextResponse.json(
				{ message: "일지를 찾을 수 없습니다" },
				{ status: 404 }
			);
		}
		if (error.response?.status === 401) {
			return NextResponse.json(
				{ message: "인증이 필요합니다" },
				{ status: 401 }
			);
		}
		if (error.response?.status === 403) {
			return NextResponse.json(
				{ message: "본인의 일지만 조회 가능합니다" },
				{ status: 403 }
			);
		}
		return NextResponse.json(
			{
				message:
					error.response?.data?.message ||
					error.message ||
					"일지 조회 실패",
			},
			{ status: error.response?.status || 500 }
		);
	}
}

// PUT: 일지 수정
export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ diaryId: string }> }
) {
	try {
		const { diaryId } = await params;
		const body = await req.json();
		const response = await serverAxiosService.put(`/api/diary/${diaryId}`, body);
		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		if (error.response?.status === 404) {
			return NextResponse.json(
				{ message: "일지를 찾을 수 없습니다" },
				{ status: 404 }
			);
		}
		if (error.response?.status === 401) {
			return NextResponse.json(
				{ message: "인증이 필요합니다" },
				{ status: 401 }
			);
		}
		if (error.response?.status === 403) {
			return NextResponse.json(
				{ message: "본인의 일지만 수정 가능합니다" },
				{ status: 403 }
			);
		}
		return NextResponse.json(
			{
				message:
					error.response?.data?.message ||
					error.message ||
					"일지 수정 실패",
			},
			{ status: error.response?.status || 500 }
		);
	}
}

// DELETE: 일지 삭제
export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ diaryId: string }> }
) {
	try {
		const { diaryId } = await params;
		const response = await serverAxiosService.delete(`/api/diary/${diaryId}`);
		return NextResponse.json(
			{ message: "일지가 삭제되었습니다" },
			{ status: 200 }
		);
	} catch (error: any) {
		if (error.response?.status === 404) {
			return NextResponse.json(
				{ message: "일지를 찾을 수 없습니다" },
				{ status: 404 }
			);
		}
		if (error.response?.status === 401) {
			return NextResponse.json(
				{ message: "인증이 필요합니다" },
				{ status: 401 }
			);
		}
		if (error.response?.status === 403) {
			return NextResponse.json(
				{ message: "본인의 일지만 삭제 가능합니다" },
				{ status: 403 }
			);
		}
		return NextResponse.json(
			{
				message:
					error.response?.data?.message ||
					error.message ||
					"일지 삭제 실패",
			},
			{ status: error.response?.status || 500 }
		);
	}
}
