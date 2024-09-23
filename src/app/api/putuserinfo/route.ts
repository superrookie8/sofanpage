import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
	const authHeader = req.headers.get("Authorization");
	const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

	if (!token) {
		console.error("Unauthorized: No token provided");
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await req.formData();
		const description = formData.get("description")?.toString();
		const photo = formData.get("photo");


		// 유효성 검사 수정: description이나 photo 둘 중 하나만 있어도 처리
		if (!description && !photo) {
			return NextResponse.json(
				{ message: "Either description or photo is required" },
				{ status: 422 }
			);
		}

		const backendFormData = new FormData();
		if (description) {
			backendFormData.append("description", description);
		}
		if (photo) {
			backendFormData.append("photo", photo);
		}

		const backendUrl = `${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/put/userinfo`;


		const response = await fetch(backendUrl, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: backendFormData,
			cache: "no-store",
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error("Backend error:", errorData.message);
			throw new Error(errorData.message);
		}

		const data = await response.json();

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		let errorMessage = "An unknown error occurred";
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		return NextResponse.json({ message: errorMessage }, { status: 500 });
	}
}
