import { adminBackendFetch } from "@/lib/admin/backend";
import { NextResponse } from "next/server";

export async function GET() {
	const verification = await adminBackendFetch("/api/admin/security/status");
	if (!verification.ok) return verification;
	return NextResponse.json({ authenticated: true }, { headers: { "Cache-Control": "private, no-store" } });
}
