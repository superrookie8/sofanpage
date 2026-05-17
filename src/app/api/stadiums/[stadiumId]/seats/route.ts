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
		const response = await fetch(
			`${backApiUrl}/api/stadiums/${stadiumKey}/seats`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store",
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to fetch seats");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
