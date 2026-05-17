import { NextRequest, NextResponse } from "next/server";
import {
	decodeStadiumPathParam,
	encodeStadiumPathParam,
} from "@/lib/stadium/encodeStadiumPathParam";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ stadiumId: string }> }
) {
	try {
		const backApiUrl = process.env.NEXT_PUBLIC_BACKAPI_URL;
		if (!backApiUrl) {
			return NextResponse.json(
				{ message: "NEXT_PUBLIC_BACKAPI_URL이 설정되지 않았습니다" },
				{ status: 500 }
			);
		}

		const { stadiumId: rawParam } = await params;
		const stadiumKey = encodeStadiumPathParam(decodeStadiumPathParam(rawParam));
		const backendUrl = `${backApiUrl}/api/stadiums/${stadiumKey}/seats/hierarchy`;
		
		const response = await fetch(backendUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			cache: "no-store",
		});

		if (!response.ok) {
			let errorData;
			try {
				errorData = await response.json();
			} catch {
				errorData = { message: await response.text() };
			}
			return NextResponse.json(
				{
					message:
						errorData.message ||
						`좌석 계층 조회 실패 (${response.status})`,
				},
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}

