import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";

// DELETE: 방명록 삭제
export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ guestbookId: string }> }
) {
	try {
		const { guestbookId } = await params;
		const response = await serverAxiosService.delete(
			`/api/delete/guestbook?entry_id=${guestbookId}`
		);
		return NextResponse.json(
			{ message: "방명록이 삭제되었습니다" },
			{ status: 200 }
		);
	} catch (error: any) {
		if (error.response?.status === 404) {
			return NextResponse.json(
				{ message: "방명록을 찾을 수 없습니다" },
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
				{ message: "본인의 방명록만 삭제 가능합니다" },
				{ status: 403 }
			);
		}
		return NextResponse.json(
			{
				message:
					error.response?.data?.message || error.message || "방명록 삭제 실패",
			},
			{ status: error.response?.status || 500 }
		);
	}
}
