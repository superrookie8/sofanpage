import { NextRequest, NextResponse } from "next/server";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(req: NextRequest) {
	try {
		const contentType = req.headers.get("content-type") || "";
		if (!contentType.startsWith("multipart/form-data")) {
			return NextResponse.json(
				{ message: "Unsupported content type" },
				{ status: 400 }
			);
		}

		const formData = await req.formData();
		const token = req.headers.get("authorization") || "";

		const response = await fetch("http://127.0.0.1:5000/api/admin/postphoto", {
			method: "POST",
			headers: {
				Authorization: token,
			},
			body: formData,
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || "Failed to upload photos to backend");
		}

		return NextResponse.json({ message: "Photos uploaded successfully", data });
	} catch (error: any) {
		console.error("Error uploading photos:", error);
		return NextResponse.json(
			{ message: error.message || "Failed to upload photos" },
			{ status: 500 }
		);
	}
}
