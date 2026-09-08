import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";
import {
  fetchSearchPage,
  searchInput,
  SearchError,
} from "@/lib/admin/news-search";
let nextAllowed = 0;
export async function POST(request: NextRequest) {
  const rejected = rejectCrossOriginMutation(request);
  if (rejected) return rejected;
  const auth = await adminBackendFetch("/api/admin/security/status");
  if (!auth.ok) return auth;
  try {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      throw new SearchError("JSON 검색 조건이 필요합니다.", 400);
    }
    const input = searchInput(raw);
    if (Date.now() < nextAllowed)
      return NextResponse.json(
        { message: "잠시 후 다시 검색해주세요." },
        { status: 429, headers: { "Retry-After": "1" } },
      );
    nextAllowed = Date.now() + 350;
    const result = await fetchSearchPage(
      input,
      {
        id: process.env.NAVER_CLIENT_ID ?? "",
        secret: process.env.NAVER_CLIENT_SECRET ?? "",
      },
      request.signal,
    );
    return NextResponse.json(
      {
        ...result,
        start: input.start,
        nextStart:
          input.start + result.inspected <= Math.min(result.total, 1000) &&
          result.inspected === input.display
            ? input.start + result.inspected
            : null,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof SearchError
            ? error.message
            : "검색이 중단되었습니다.",
      },
      { status: error instanceof SearchError ? error.status : 502 },
    );
  }
}
