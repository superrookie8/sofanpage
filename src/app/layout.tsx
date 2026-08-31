import type { Metadata } from "next";
import "./globals.css";
import RecoilRootProvider from "@/utils/recoilRootProvider";
import ScriptProvider from "@/utils/scriptProvider";

export const metadata: Metadata = {
	title: { default: "BNK No.6 이소희", template: "%s | Super Sohee" },
	description: "BNK SUM No.6 이소희 선수 팬페이지 관리자.",
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
	],
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ko">
			<ScriptProvider />
			<body>
				<RecoilRootProvider>{children}</RecoilRootProvider>
			</body>
		</html>
	);
}
