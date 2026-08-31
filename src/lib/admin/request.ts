import { NextRequest, NextResponse } from "next/server.js";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function rejectCrossOriginMutation(request: NextRequest): NextResponse | null {
	if (!MUTATION_METHODS.has(request.method)) return null;

	const origin = request.headers.get("origin");
	const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
	if (!origin || !host) {
		return NextResponse.json({ message: "요청 출처를 확인할 수 없습니다." }, { status: 403 });
	}

	try {
		if (new URL(origin).host !== host) {
			return NextResponse.json({ message: "허용되지 않은 요청 출처입니다." }, { status: 403 });
		}
	} catch {
		return NextResponse.json({ message: "요청 출처가 올바르지 않습니다." }, { status: 403 });
	}

	return null;
}
