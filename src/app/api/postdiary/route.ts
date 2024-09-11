import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(`${key}:`, value);
    });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/post_diary`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      // JSON 형식의 에러 메시지를 반환
      const errorData = await response.json();
      console.error("Backend error:", errorData); 
      throw new Error(errorData.message || "Failed to post diary entry.");
    }

    return NextResponse.json({ status: "Diary entry added" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


