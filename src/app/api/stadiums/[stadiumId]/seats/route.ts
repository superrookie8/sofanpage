import { NextRequest, NextResponse } from "next/server";
import serverAxiosService from "@/lib/server/http/axiosService";
import {
	decodeStadiumPathParam,
	encodeStadiumPathParam,
} from "@/lib/stadium/encodeStadiumPathParam";

export const runtime = "nodejs";

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ stadiumId: string }> }
) {
	try {
		if (!process.env.NEXT_PUBLIC_BACKAPI_URL) {
			return NextResponse.json(
				{ message: "NEXT_PUBLIC_BACKAPI_URL이 설정되지 않았습니다" },
				{ status: 500 }
			);
		}

		const { stadiumId: rawParam } = await params;
		const stadiumKey = encodeStadiumPathParam(decodeStadiumPathParam(rawParam));
		const response = await serverAxiosService.get(
			`/api/stadiums/${stadiumKey}/seats`
		);
		return NextResponse.json(response.data, { status: 200 });
	} catch (error: unknown) {
		const err = error as {
			response?: { status?: number; data?: { message?: string } };
			message?: string;
		};
		const status = err.response?.status ?? 500;
		const message =
			err.response?.data?.message ??
			err.message ??
			"Failed to fetch seats";
		return NextResponse.json({ message }, { status });
	}
}
