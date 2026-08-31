import { NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { toLegacyProfile } from "@/lib/admin/adapters";

export async function GET() {
	const response = await adminBackendFetch("/api/admin/profile");
	if (!response.ok) return response;
	return NextResponse.json(toLegacyProfile(await response.json()));
}
