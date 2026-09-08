import { NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { deploymentChecks } from "@/lib/admin/security";
export async function GET() {
  const response = await adminBackendFetch("/api/admin/security/status");
  if (!response.ok) return response;
  try {
    const body = await response.json();
    if (!Array.isArray(body.checks)) throw new Error();
    return NextResponse.json(
      {
        checkedAt: new Date().toISOString(),
        checks: [...body.checks, ...deploymentChecks(process.env)],
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { message: "보안 점검 응답을 확인할 수 없습니다." },
      { status: 502 },
    );
  }
}
