import { NextRequest, NextResponse } from "next/server";
import { rejectCrossOriginMutation } from "@/lib/admin/request";
import { clearAdminSession, getAdminToken, isTokenExpired } from "@/lib/admin/session";

export async function GET() {
	const token = await getAdminToken();
	if (!token || isTokenExpired(token)) {
		const response = NextResponse.json({ authenticated: false }, { status: 401 });
		if (token) clearAdminSession(response);
		return response;
	}
	return NextResponse.json({ authenticated: true });
}

export async function DELETE(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const response = NextResponse.json({ authenticated: false });
	clearAdminSession(response);
	return response;
}
