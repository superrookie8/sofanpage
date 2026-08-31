import { NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { toLegacyStats } from "@/lib/admin/adapters";

export async function GET() {
	const response = await adminBackendFetch("/api/admin/playerstat");
	if (!response.ok) return response;
	const body = await response.json() as Array<Record<string, unknown>>;
	return NextResponse.json(body.map(toLegacyStats));
}
