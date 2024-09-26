// src/app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script"; // Import Script from next
import "./globals.css";
import { QueryClient, QueryClientProvider } from 'react-query';
import RecoilRootProvider from "@/utils/recoilRootProvider";
import ScriptProvider from "@/utils/scriptProvider";
import ClientWrapper from "@/components/clientWrapper";
import Header from "@/components/header";
import Background from "@/components/background";

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
	],
};

const queryClient = new QueryClient();

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			{/* Google Tag Manager Script */}
			<meta charSet="UTF-8"></meta>
			<Script
				async
				src="https://www.googletagmanager.com/gtag/js?id=G-FESK7ETCDB"
			></Script>
			<Script id="google-analytics" strategy="afterInteractive">
				{`
				  window.dataLayer = window.dataLayer || [];
				  function gtag(){dataLayer.push(arguments);}
				  gtag('js', new Date());
				  gtag('config', 'G-FESK7ETCDB');
				`}
			</Script>
			<ScriptProvider />
			<body>
				<QueryClientProvider client={queryClient}>
					<RecoilRootProvider>
						<Background />
						<Header />
						<ClientWrapper>{children}</ClientWrapper>
					</RecoilRootProvider>
				</QueryClientProvider>
			</body>
		</html>
	);
}
