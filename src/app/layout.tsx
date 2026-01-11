// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script"; // Import Script from next
import "./globals.css";
import Providers from "@/components/providers/sessionProvider";
import { authOptions } from "@/config/auth";
import { getServerSession } from "next-auth";
import ScriptProvider from "@/utils/scriptProvider";
import ClientWrapper from "@/shared/ui/clientWrapper";
import Header from "@/shared/ui/header";
import Background from "@/components/opening/background";
import { LoadingProvider } from "@/context/LoadingContext";
import LoadingSpinner from "@/shared/ui/loadingSpinner";

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

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// 세션 에러 처리 추가 - JWT 복호화 실패 시에도 앱이 계속 작동하도록
	let session = null;

	// NEXTAUTH_SECRET이 없으면 세션을 가져오지 않음
	if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
		console.warn("NEXTAUTH_SECRET is not set. Session will not be available.");
	} else {
		try {
			session = await getServerSession(authOptions);
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
		<html lang="en">
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
