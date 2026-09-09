import { NextRequest, NextResponse } from "next/server";
import { getRequestAccessToken } from "@/lib/server/http/getRequestAccessToken";
import { resolveBackendApiUrl } from "@/lib/server/http/backendApi";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * 프로필 사진 전용 업로드. R2 키만 돌려주고, 화면에 쓸 주소는 프로필 저장 후
 * /api/users/me 응답이 서명된 URL로 내려준다.
 *
 * backend의 /api/images/profile은 인증된 user id 아래에 owner-safe key를 만든다.
 * 탈퇴 시 해당 사용자 prefix만 정리할 수 있도록 일반 업로드 경로와 섞지 않는다.
 */
export async function POST(request: NextRequest) {
	const token = await getRequestAccessToken(request);
	if (!token) {
		return NextResponse.json({ message: "인증이 필요합니다" }, { status: 401 });
	}

	let file: FormDataEntryValue | null;
	try {
		file = (await request.formData()).get("file");
	} catch {
		return NextResponse.json(
			{ message: "이미지를 읽지 못했습니다" },
			{ status: 400 }
		);
	}

	if (!(file instanceof File)) {
		return NextResponse.json({ message: "이미지를 선택해 주세요" }, { status: 400 });
	}
	if (!ALLOWED_TYPES.includes(file.type)) {
		return NextResponse.json(
			{ message: "JPG, PNG, WEBP 이미지만 올릴 수 있습니다" },
			{ status: 400 }
		);
	}
	if (file.size > MAX_BYTES) {
		return NextResponse.json(
			{ message: "이미지는 5MB 이하만 올릴 수 있습니다" },
			{ status: 413 }
		);
	}

	const upstreamForm = new FormData();
	upstreamForm.append("file", file);

	try {
		const response = await fetch(`${resolveBackendApiUrl()}/api/images/profile`, {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: upstreamForm,
			cache: "no-store",
		});

		if (!response.ok) {
			return NextResponse.json(
				{ message: "이미지를 올리지 못했습니다" },
				{ status: response.status }
			);
		}

		const data = (await response.json()) as { key?: unknown };
		if (typeof data.key !== "string" || !data.key) {
			return NextResponse.json(
				{ message: "이미지를 올리지 못했습니다" },
				{ status: 502 }
			);
		}
		return NextResponse.json({ key: data.key }, { status: 200 });
	} catch {
		// 토큰과 upstream 본문은 로그에 남기지 않는다.
		console.error("Profile photo upload failed");
		return NextResponse.json(
			{ message: "이미지를 올리지 못했습니다" },
			{ status: 502 }
		);
	}
}
