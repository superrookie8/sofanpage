import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
	const token = req.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const formData = await req.formData();
		const description = formData.get("description")?.toString();
		const photo = formData.get("photo");

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
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message);
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		let errorMessage = "An unknown error occurred";
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		console.error("Error processing request:", errorMessage);
		return NextResponse.json({ message: errorMessage }, { status: 500 });
	}
}
