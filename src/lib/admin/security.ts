import { trustedAdminOrigin } from "./origin";
export type SecurityCheck = {
  id: string;
  status: "pass" | "warn" | "fail";
  message: string;
};
export function deploymentChecks(
  env: Record<string, string | undefined>,
): SecurityCheck[] {
  let secureOrigin = false;
  try {
    const u = new URL(trustedAdminOrigin(env));
    secureOrigin = u.protocol === "https:";
  } catch {}
  const backend = env.BACKEND_API_URL ?? env.BACKAPI_URL;
  let secureBackend = false;
  try {
    secureBackend = new URL(backend ?? "").protocol === "https:";
  } catch {}
  return [
    {
      id: "admin_origin",
      status: secureOrigin ? "pass" : "fail",
      message: secureOrigin
        ? "관리자 HTTPS 출처가 지정되어 있습니다."
        : "기존 사이트 HTTPS 출처 설정을 확인하세요.",
    },
    {
      id: "admin_session",
      status: env.NODE_ENV === "production" ? "pass" : "warn",
      message:
        env.NODE_ENV === "production"
          ? "기존 사이트 로그인 세션을 사용하며 관리자 권한은 서버에서 확인합니다."
          : "개발 환경입니다. 실제 운영 로그인과 권한 회수를 별도로 확인하세요.",
    },
    {
      id: "backend_transport",
      status: secureBackend ? "pass" : "warn",
      message: secureBackend
        ? "서버 전용 HTTPS 백엔드가 설정되어 있습니다."
        : "서버 전용 BACKEND_API_URL과 전송 구간 보호를 확인하세요.",
    },
    {
      id: "naver_config",
      status: env.NAVER_CLIENT_ID && env.NAVER_CLIENT_SECRET ? "pass" : "warn",
      message:
        env.NAVER_CLIENT_ID && env.NAVER_CLIENT_SECRET
          ? "네이버 검색 인증 설정이 있습니다. 실제 유효성은 검색으로 확인하세요."
          : "네이버 검색 인증 설정이 필요합니다.",
    },
    {
      id: "diagnostic_scope",
      status: "warn",
      message:
        "설정 점검입니다. DNS·외부 TLS·접근제어·침투 테스트 통과를 보증하지 않습니다.",
    },
  ];
}
