import { NextRequest, NextResponse } from "next/server";
import multiparty from "multiparty";
import { promises as fsPromises } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { FormData as NodeFormData } from "formdata-node";
import { fileFromPathSync } from "formdata-node/file-from-path";

export const config = {
	api: {
		bodyParser: false,
	},
};

const parseForm = (req: any): Promise<{ fields: any; files: any }> => {
	return new Promise((resolve, reject) => {
		const form = new multiparty.Form({ uploadDir: "/tmp" });
		form.parse(req, (err, fields, files) => {
			if (err) reject(err);
			else resolve({ fields, files });
		});
	});
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

		const tempDir = path.join("/tmp", `upload-${Date.now()}`);
		await fsPromises.mkdir(tempDir, { recursive: true });
		console.log("Temporary directory created:", tempDir);

		const formData = new NodeFormData();
		const parts = buffer.toString().split("boundary");

		const files: string[] = [];
		for (const part of parts) {
			if (part.includes("filename")) {
				const match = part.match(/filename="([^"]+)"/);
				if (match) {
					const filename = match[1];
					const filePath = path.join(tempDir, filename);
					const fileContent = part.split("\r\n\r\n")[1].split("\r\n--")[0];
					await fsPromises.writeFile(filePath, fileContent, "binary");
					console.log(`File written to: ${filePath}`);
					files.push(filePath);
					formData.append("photos", fileFromPathSync(filePath));
					formData.append("photo_ids", uuidv4());
					formData.append("upload_times", new Date().toISOString());
				}
			}
			console.log("good", formData);
		}

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

		for (const filePath of files) {
			await fsPromises.unlink(filePath);
		}
		await fsPromises.rmdir(tempDir);

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
