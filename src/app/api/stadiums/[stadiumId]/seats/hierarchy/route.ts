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
		const path = `/api/stadiums/${stadiumKey}/seats/hierarchy`;

		const response = await serverAxiosService.get(path);
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
			"좌석 계층 구조를 불러오지 못했습니다";

		console.error("[hierarchy] error", { status, message });
		return NextResponse.json({ message }, { status });
	}
}
