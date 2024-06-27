import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { name, message, photo, date } = await req.json();

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/post_guestbook`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name, message, photo, date }),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to post guestbook entry.");
		}

		return NextResponse.json(
			{ status: "Guestbook entry added" },
			{ status: 200 }
		);
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
