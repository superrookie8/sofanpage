// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script"; // Import Script from next
import "./globals.css";
import Providers from "@/components/providers/sessionProvider";
import { getServerSession } from "next-auth";
import { getMissingAuthEnvironmentKeys } from "@/features/auth/server/authEnvironment";
import ScriptProvider from "@/utils/scriptProvider";
import ClientWrapper from "@/shared/ui/clientWrapper";
import Header from "@/shared/ui/header";
import Background from "@/components/opening/background";
import { LoadingProvider } from "@/context/LoadingContext";
import LoadingSpinner from "@/shared/ui/loadingSpinner";

// next-auth(getServerSession)가 headers/cookies를 사용하므로
// 루트 레이아웃은 정적 프리렌더링(SSG) 대상이 되면 빌드가 실패할 수 있음.
// 전체 앱을 동적 렌더링으로 명시해 빌드/배포에서 안정적으로 동작하게 함.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: {
		default: "농구선수 이소희 팬페이지 SUPER SOHEE",
		template: "%s | Lee Sohee",
	},
	description:
		"Welcome to the fan page of BNK NO 6. Lee Sohee. 농구선수 이소희의 팬페이지 입니다!",
	keywords: [
		"WKBL",
		"BNK SUM",
		"BNK썸",
		"슈퍼소닉",
		"여자농구",
		"농구선수 이소희",
		"한국여자프로농구",
		"듀얼가드",
		"발발이",
		"슈팅가드",
		"이소희선수",
		"농구선수이소희",
		"국가대표이소희",
		"히쏘",
		"농구이소희",
		"슈퍼소히",
		"슈퍼소희",
		"supersohee",
	],
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/favicon.ico",
	},
};

let hasReportedMissingAuthConfiguration = false;

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// 세션 에러 처리 추가 - JWT 복호화 실패 시에도 앱이 계속 작동하도록
	let session = null;
	const missingAuthKeys = getMissingAuthEnvironmentKeys(process.env);

	// 인증 설정 오류가 공개 페이지 전체를 500으로 만들지 않도록 세션만 비활성화한다.
	// NextAuth API route는 동일한 설정을 엄격하게 검증하므로 로그인은 fail closed다.
	if (missingAuthKeys.length > 0) {
		if (!hasReportedMissingAuthConfiguration) {
			console.error(
				`Authentication is unavailable. Missing configuration: ${missingAuthKeys.join(
					", "
				)}`
			);
			hasReportedMissingAuthConfiguration = true;
		}
	} else {
		try {
			const { getAuthOptions } = await import("@/config/auth");
			session = await getServerSession(getAuthOptions());
		} catch (error: any) {
			// JWT 복호화 실패 시 세션을 null로 처리
			// Next-Auth가 내부적으로 에러를 로깅하지만, 앱은 계속 작동하도록 함
			if (error?.message?.includes("decryption")) {
				// 손상된 쿠키로 인한 에러는 조용히 처리
				session = null;
			} else {
				console.error("Session error:", error);
				session = null;
			}
		}
	}

	return (
		<html lang="ko">
			{/* Google Tag Manager Script */}
			<Script
				async
				src="https://www.googletagmanager.com/gtag/js?id=G-FESK7ETCDB"
			></Script>
			<Script id="google-analytics" strategy="afterInteractive">
				{`
				  if (typeof window !== 'undefined') {
				    window.dataLayer = window.dataLayer || [];
				    function gtag(){dataLayer.push(arguments);}
				    gtag('config', 'G-FESK7ETCDB');
				  }
				`}
			</Script>
			<ScriptProvider />
			<body>
				<Providers session={session}>
					<LoadingProvider>
						<LoadingSpinner />
						<Background />
						<Header />
						<ClientWrapper>{children}</ClientWrapper>
					</LoadingProvider>
				</Providers>
			</body>
		</html>
	);
}
