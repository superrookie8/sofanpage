import { NextRequest, NextResponse } from "next/server";

// GET: 프로필 정보 조회 (공개 정보)
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const nickname = searchParams.get("nickname");

		const backendResponse = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/player${
				nickname ? `?nickname=${nickname}` : ""
			}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store",
			}
		);

		if (!backendResponse.ok) {
			const errorData = await backendResponse.json();
			throw new Error(errorData.message || "Failed to get profile.");
		}

		const backendData = await backendResponse.json();
		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
