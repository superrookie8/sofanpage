import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
	const token = req.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const { searchParams } = new URL(req.url);
		const entryId = searchParams.get("entry_id");

		if (!entryId) {
			return NextResponse.json(
				{ message: "Entry ID is required" },
				{ status: 400 }
			);
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/delete/guestbook?entry_id=${entryId}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message);
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		if (error instanceof Error) {
			return NextResponse.json({ message: error.message }, { status: 500 });
		} else {
			return NextResponse.json(
				{ message: "An unknown error occurred" },
				{ status: 500 }
			);
		}
	}
}
