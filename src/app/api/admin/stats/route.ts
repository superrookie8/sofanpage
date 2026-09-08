import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import {
	DUPLICATE_STATS_SEASON_MESSAGE,
	legacyStatsRequest,
	StatsValidationError,
} from "@/lib/admin/adapters";
import { rejectCrossOriginMutation } from "@/lib/admin/request";

export async function POST(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const body = await request.json();
	const id = typeof body?._id === "string" ? body._id : "";
	let payload: Record<string, unknown>;
	try {
		payload = legacyStatsRequest(body);
	} catch (error) {
		if (error instanceof StatsValidationError) {
			return NextResponse.json({ message: error.message }, { status: 400 });
		}
		throw error;
	}
	if (!id) {
		const listResponse = await adminBackendFetch("/api/admin/playerstat");
		if (!listResponse.ok) return listResponse;
		const existing = await listResponse.json() as Array<{ season?: unknown }>;
		const season = String(payload.season ?? "").trim();
		if (existing.some((stat) => String(stat.season ?? "").trim() === season)) {
			return NextResponse.json(
				{ message: DUPLICATE_STATS_SEASON_MESSAGE },
				{ status: 409 }
			);
		}
	}
	return adminBackendFetch(`/api/admin/playerstat${id ? `/${encodeURIComponent(id)}` : ""}`, {
		method: id ? "PUT" : "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
}

export async function DELETE(request: NextRequest) {
	const rejected = rejectCrossOriginMutation(request);
	if (rejected) return rejected;
	const { id } = await request.json() as { id?: string };
	if (!id) return NextResponse.json({ message: "id가 필요합니다." }, { status: 400 });
	return adminBackendFetch(`/api/admin/playerstat/${encodeURIComponent(id)}`, { method: "DELETE" });
}
