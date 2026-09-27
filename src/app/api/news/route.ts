import { NextRequest, NextResponse } from "next/server";
import { resolveBackendApiUrl } from "@/lib/server/http/backendApi";

export async function GET(request: NextRequest) {
	const params = new URL(request.url).searchParams;
	const page = params.get("page") ?? "0";
	const limit = params.get("limit") ?? "8";
	const source = params.get("source") ?? "all";
	if (!/^\d+$/.test(page) || Number(page) > 999999 || !/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 100 || !["all", "jumpball", "rookie", "other"].includes(source)) {
		return NextResponse.json({ error: "잘못된 페이지 요청입니다." }, { status: 400 });
	}
	try {
		const query = new URLSearchParams({ page: String(Number(page)), limit: String(Number(limit)), source });
		const response = await fetch(`${resolveBackendApiUrl()}/api/articles?${query}`, { cache: "no-store", signal: AbortSignal.timeout(10000) });
		if (!response.ok) return NextResponse.json({ error: "기사를 불러오지 못했습니다." }, { status: response.status });
		return NextResponse.json(await response.json());
	} catch {
		return NextResponse.json({ error: "기사 서버에 연결하지 못했습니다." }, { status: 502 });
	}
}
