import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";

// GET: 방명록 목록 조회
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const page = parseInt(searchParams.get("page") || "1", 10);
		const pageSize = parseInt(searchParams.get("page_size") || "10", 10);
		const user = searchParams.get("user");

		let url = `/api/get_guestbook_entries?page=${page}&page_size=${pageSize}`;
		if (user) {
			url += `&user=${user}`;
		}

		const response = await serverAxiosService.get(url);
		return NextResponse.json(response.data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{
				message:
					error.response?.data?.message || error.message || "방명록 조회 실패",
			},
			{ status: error.response?.status || 500 }
		);
	}
}

// POST: 방명록 작성
export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/post_guestbook`,
			{
				method: "POST",
				body: formData,
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to post guestbook entry.");
		}

		return NextResponse.json(
			{ status: "Guestbook entry added" },
			{ status: 201 }
		);
	} catch (error: any) {
		return NextResponse.json(
			{
				message: error.message || "방명록 작성 실패",
			},
			{ status: 500 }
		);
	}
}
