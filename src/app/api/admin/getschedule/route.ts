import { scheduleFilterParams, type ScheduleFilters } from "@/features/games/competition";
import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { toLegacySchedule } from "@/lib/admin/adapters";

export async function GET(request: NextRequest) {
	const filters = Object.fromEntries(request.nextUrl.searchParams) as ScheduleFilters;
	const query = scheduleFilterParams(filters).toString();
	const response = await adminBackendFetch(`/api/admin/schedules${query ? `?${query}` : ""}`);
	if (!response.ok) return response;
	const body = await response.json();
	return NextResponse.json(body.map(toLegacySchedule));
}
