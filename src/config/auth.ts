import type { NextAuthOptions } from "next-auth";
import {
	loadAuthEnvironment,
	type AuthEnvironment,
} from "@/features/auth/server/authEnvironment";
import { createAuthOptions } from "@/features/auth/server/createAuthOptions";

// 모듈 로드 시점에 검증하면 next build의 "Collecting page data" 단계에서도
// 실제 시크릿이 필요해져 빌드가 깨진다(빌드 컨테이너에는 .env가 없음).
// 최초 요청 시점에 한 번만 검증하도록 지연 평가한다. 설정이 없으면 요청 처리
// 중에 throw 되므로 런타임 fail-closed 동작은 그대로 유지된다.
let cachedAuthEnvironment: AuthEnvironment | null = null;
let cachedAuthOptions: NextAuthOptions | null = null;

export function getAuthEnvironment(): AuthEnvironment {
	if (!cachedAuthEnvironment) {
		cachedAuthEnvironment = loadAuthEnvironment(process.env);
	}
	return cachedAuthEnvironment;
}

export function getAuthOptions(): NextAuthOptions {
	if (!cachedAuthOptions) {
		cachedAuthOptions = createAuthOptions(getAuthEnvironment());
	}
	return cachedAuthOptions;
}
