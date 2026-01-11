import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ stadiumId: string }> }
) {
	try {
		const { stadiumId } = await params;
		// 경기장 이름을 URL 디코딩 (프론트엔드에서 인코딩했을 수 있음)
		const stadiumName = decodeURIComponent(stadiumId);
		const encodedStadiumName = encodeURIComponent(stadiumName);
		
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
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/stadiums/${encodedStadiumName}/seat?${queryParams.toString()}`,
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

