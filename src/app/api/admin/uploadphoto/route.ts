import { NextRequest, NextResponse } from "next/server";
import { FormData as NodeFormData } from "formdata-node";
import { promises as fsPromises } from "fs";
import { v4 as uuidv4 } from "uuid";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(req: NextRequest) {
	try {
		console.log("Starting POST request");

		if (!req.body) {
			throw new Error("Readable stream not found in request body");
		}

		const buffers: Uint8Array[] = [];
		const reader = req.body.getReader();

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffers.push(value);
		}

		const buffer = Buffer.concat(buffers);
		console.log("Buffer length:", buffer.length);

		const boundary = req.headers.get("content-type")?.split("boundary=")[1];
		if (!boundary) {
			throw new Error("Boundary not found");
		}

		const formData = new NodeFormData();
		const parts = buffer.toString().split(`--${boundary}`);
		const files = [];

		for (const part of parts) {
			if (part.includes("filename")) {
				const filenameMatch = part.match(/filename="([^"]+)"/);
				const filename = filenameMatch ? filenameMatch[1] : `file-${uuidv4()}`;
				const fileContent = part.split("\r\n\r\n")[1].split("\r\n--")[0];
				formData.append("photos", new Blob([fileContent]), filename);
				formData.append("photo_ids", uuidv4());
				formData.append("upload_times", new Date().toISOString());
			}
		}

		console.log("FormData prepared:", formData);

		const token = req.headers.get("authorization") || "";
		console.log("Authorization token:", token);

		const response = await fetch("http://127.0.0.1:5000/api/admin/postphoto", {
			method: "POST",
			headers: {
				Authorization: token,
			},
			body: formData as any,
		});

		const data = await response.json();
		console.log("Backend response:", data);

		if (!response.ok) {
			console.error("Backend response error", data);
			throw new Error(data.message || "Failed to upload photos to backend");
		}

		console.log("Photos uploaded successfully", data);
		return NextResponse.json({ message: "Photos uploaded successfully", data });
	} catch (error: any) {
		console.error("Error uploading photos:", error);
		return NextResponse.json(
			{ message: error.message || "Failed to upload photos" },
			{ status: 500 }
		);
	}
}
