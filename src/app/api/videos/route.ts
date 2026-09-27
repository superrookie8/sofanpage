import { NextRequest, NextResponse } from "next/server";
import { resolveBackendApiUrl } from "@/lib/server/http/backendApi";
import { videoQuery } from "@/features/videos/links";

export async function GET(request: NextRequest) {
	const query = videoQuery(new URL(request.url).searchParams);
	if (!query) return NextResponse.json({ message: "잘못된 영상 조회 조건입니다." }, { status: 400 });
	try {
		const response = await fetch(`${resolveBackendApiUrl()}/api/videos?${query}`, { cache: "no-store", signal: AbortSignal.timeout(10000) });
		if (!response.ok) return NextResponse.json({ message: "영상을 불러오지 못했습니다." }, { status: response.status });
		return NextResponse.json(await response.json());
	} catch { return NextResponse.json({ message: "영상 서버에 연결하지 못했습니다." }, { status: 502 }); }
}
