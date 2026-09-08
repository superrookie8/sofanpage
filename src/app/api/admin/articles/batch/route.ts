import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/admin/backend";
import { rejectCrossOriginMutation } from "@/lib/admin/request";
export async function POST(request: NextRequest) {
  const rejected = rejectCrossOriginMutation(request);
  if (rejected) return rejected;
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { message: "올바른 JSON이 필요합니다." },
      { status: 400 },
    );
  }
  if (
    !Array.isArray(input?.articles) ||
    !input.articles.length ||
    input.articles.length > 200
  )
    return NextResponse.json(
      { message: "기사 1~200개를 선택해주세요." },
      { status: 400 },
    );
  return adminBackendFetch("/api/admin/articles/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articles: input.articles }),
  });
}
