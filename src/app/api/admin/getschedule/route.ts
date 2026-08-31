import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { toLegacySchedule } from "@/lib/admin/adapters";

export async function GET(request: NextRequest) {
	const season = request.nextUrl.searchParams.get("season");
	const response = await adminBackendFetch(`/api/admin/schedules${season ? `?season=${encodeURIComponent(season)}` : ""}`);
	if (!response.ok) return response;
	const body = await response.json();
	return NextResponse.json(body.map(toLegacySchedule));
}
