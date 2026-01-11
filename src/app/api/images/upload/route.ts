import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	// 모든 헤더 확인 (디버깅)
	const allHeaders = Object.fromEntries(req.headers.entries());
	console.log("=== Image Upload API Route ===");
	console.log("All headers keys:", Object.keys(allHeaders));
	console.log("All headers:", JSON.stringify(allHeaders, null, 2));

	const authHeader = req.headers.get("Authorization");
	console.log("Authorization header:", authHeader);

	// putuserinfo와 동일한 방식으로 토큰 추출
	const token = authHeader?.startsWith("Bearer ")
		? authHeader.split(" ")[1]
		: authHeader;

	// 디버깅: 토큰 확인
	console.log("Token received:", !!token);
	if (token) {
		console.log("Token length:", token.length);
		console.log("Token preview:", token.substring(0, 20) + "...");
	} else {
		console.error("No token found in headers");
		console.error("Available headers:", Object.keys(allHeaders));
	}
	console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKAPI_URL);

	if (!token) {
		console.error("Unauthorized: No token provided");
		return NextResponse.json(
			{ message: "Authentication required" },
			{ status: 401 }
		);
	}

	try {
		const formData = await req.formData();
		const file = formData.get("file");
		console.log("File received:", !!file);
		if (file instanceof File) {
			console.log("File name:", file.name);
			console.log("File size:", file.size);
			console.log("File type:", file.type);
		}

		if (!file || !(file instanceof File)) {
			console.error("No file found in FormData");
			return NextResponse.json(
				{ message: "No file provided" },
				{ status: 400 }
			);
		}

		// putuserinfo와 동일한 방식: 새로운 FormData 생성
		const backendFormData = new FormData();
		backendFormData.append("file", file);

		const backendUrl = `${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/images/upload`;
		console.log("Calling backend:", backendUrl);
		console.log("Sending token to backend:", token.substring(0, 20) + "...");
		console.log("Backend FormData file name:", file.name);
		console.log("Backend FormData file size:", file.size);

		// FormData를 전달할 때는 헤더를 명시적으로 설정
		const backendHeaders: HeadersInit = {
			Authorization: `Bearer ${token}`,
		};

		console.log("Backend request headers:", {
			Authorization: `Bearer ${token.substring(0, 20)}...`,
		});

		console.log("Sending request to backend now...");
		const response = await fetch(backendUrl, {
			method: "POST",
			headers: backendHeaders,
			body: backendFormData,
			cache: "no-store", // putuserinfo와 동일하게 추가
		});
		console.log("Backend request sent, waiting for response...");

		console.log("Backend response status:", response.status);
		console.log("Backend response ok:", response.ok);

		// Response body는 한 번만 읽을 수 있으므로 text()로 먼저 읽기
		const responseText = await response.text();
		const contentType = response.headers.get("content-type") || "";

		// HTML 응답인지 먼저 확인 (response.ok와 관계없이)
		const trimmedText = responseText.trim();
		const lowerText = trimmedText.toLowerCase();
		if (
			contentType.includes("text/html") ||
			lowerText.startsWith("<!doctype") ||
			lowerText.startsWith("<html")
		) {
			console.error(
				"Backend returned HTML instead of JSON:",
				trimmedText.substring(0, 500)
			);
			console.error("Response status was:", response.status);
			return NextResponse.json(
				{
					message:
						"백엔드 서버가 HTML을 반환했습니다. 인증 문제일 수 있습니다.",
				},
				{ status: 500 }
			);
		}

		if (!response.ok) {
			let errorMessage = "Failed to upload image";

			// JSON인지 확인 (Content-Type 또는 실제 내용으로)
			if (
				contentType.includes("application/json") ||
				trimmedText.startsWith("{")
			) {
				try {
					const errorData = JSON.parse(responseText);
					errorMessage = errorData.message || errorMessage;
					console.error("Backend error:", errorData);
				} catch (e) {
					console.error("Failed to parse error response as JSON:", e);
					console.error("Backend error text:", trimmedText.substring(0, 500));
				}
			} else {
				console.error(
					"Backend returned non-JSON error:",
					trimmedText.substring(0, 500)
				);
			}

			return NextResponse.json(
				{ message: errorMessage, status: response.status },
				{ status: response.status }
			);
		}

		// 성공 응답 처리 - JSON만 허용
		let data: any;
		if (
			contentType.includes("application/json") ||
			trimmedText.startsWith("{")
		) {
			try {
				data = JSON.parse(responseText);
			} catch (e) {
				console.error("Failed to parse JSON response:", e);
				console.error("Response text:", trimmedText.substring(0, 500));
				return NextResponse.json(
					{ message: "서버 응답을 파싱할 수 없습니다." },
					{ status: 500 }
				);
			}
		} else {
			// JSON이 아닌 경우 - R2 키 문자열로 가정하지만 HTML은 이미 위에서 차단됨
			console.log(
				"Non-JSON response (assuming R2 key string):",
				trimmedText.substring(0, 100)
			);
			data = trimmedText;
		}

		// 최종 검증: data가 HTML이 아닌지 확인
		if (typeof data === "string") {
			const lowerData = data.toLowerCase().trim();
			if (lowerData.startsWith("<!doctype") || lowerData.startsWith("<html")) {
				console.error(
					"Final validation: data is HTML:",
					data.substring(0, 200)
				);
				return NextResponse.json(
					{ message: "백엔드 서버가 HTML을 반환했습니다." },
					{ status: 500 }
				);
			}
		}

		console.log("Backend upload response:", JSON.stringify(data, null, 2));
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error("Image upload error:", error);
		console.error("Error stack:", error.stack);
		return NextResponse.json(
			{ message: error.message || "Failed to upload image" },
			{ status: 500 }
		);
	}
}
