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
		const encodedStadiumName = encodeStadiumPathParam(
			decodeStadiumPathParam(rawParam)
		);
		
		const { searchParams } = new URL(req.url);
		const zoneName = searchParams.get("zoneName");
		const blockName = searchParams.get("blockName");
		const row = searchParams.get("row");
		const number = searchParams.get("number");

		if (!zoneName || !row || !number) {
			return NextResponse.json(
				{ message: "zoneName, row, number are required" },
				{ status: 400 }
			);
		}

		// 쿼리 파라미터 구성
		const queryParams = new URLSearchParams({
			zoneName,
			row,
			number,
		});
		if (blockName) {
			queryParams.append("blockName", blockName);
		}

		const response = await fetch(
			`${backApiUrl}/api/stadiums/${encodedStadiumName}/seat?${queryParams.toString()}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store",
			}
		);

		if (!response.ok) {
			if (response.status === 404) {
				return NextResponse.json(
					{ message: "해당 좌석을 찾을 수 없습니다" },
					{ status: 404 }
				);
			}
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to fetch seat ID");
		}

		// 백엔드가 문자열을 직접 반환 (예: "seat_id_12345")
		const seatId = await response.text();
		return NextResponse.json(seatId, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}

