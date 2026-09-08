import { trustedAdminOrigin } from "./origin";
import { NextRequest, NextResponse } from "next/server";
const MUTATIONS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
export function rejectCrossOriginMutation(
  request: NextRequest,
): NextResponse | null {
  if (!MUTATIONS.has(request.method)) return null;
  try {
    const expected = new URL(trustedAdminOrigin(process.env, new URL(request.url).origin));
    const supplied = request.headers.get("origin");
    if (
      !supplied ||
      new URL(supplied).origin !== expected.origin ||
      (process.env.NODE_ENV === "production" && expected.protocol !== "https:")
    )
      throw new Error();
    if (request.headers.get("sec-fetch-site") === "cross-site")
      throw new Error();
    return null;
  } catch {
    return NextResponse.json(
      { message: "허용되지 않은 요청 출처입니다." },
      { status: 403 },
    );
  }
}
