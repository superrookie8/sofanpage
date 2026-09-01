"use client";

import Script from "next/script";
import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { GA_MEASUREMENT_ID, sendPageView } from "@/lib/analytics/gtag";

/**
 * App Router는 화면을 갈아끼워도 문서를 새로 읽지 않아 gtag가 이동을 눈치채지 못한다.
 * 경로가 바뀔 때마다 page_view를 직접 보낸다.
 *
 * 첫 렌더는 건너뛴다. 최초 1회는 gtag('config')가 이미 보내기 때문에,
 * 여기서 또 보내면 진입 페이지만 두 번 집계된다.
 */
function PageViewTracker() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		const query = searchParams.toString();
		sendPageView(query ? `${pathname}?${query}` : pathname);
	}, [pathname, searchParams]);

	return null;
}

/**
 * GA4 부트스트랩.
 *
 * NEXT_PUBLIC_GA_ID가 비어 있으면 스크립트조차 넣지 않는다. 로컬·프리뷰에서
 * 아무것도 수집되지 않는 게 기본값이고, 운영에서만 값을 채운다.
 */
export default function GoogleAnalytics() {
	if (!GA_MEASUREMENT_ID) return null;

	return (
		<>
			<Script
				src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
				strategy="afterInteractive"
			/>
			<Script id="ga-bootstrap" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.gtag = function gtag(){ window.dataLayer.push(arguments); };
					window.gtag('js', new Date());
					window.gtag('config', '${GA_MEASUREMENT_ID}');
				`}
			</Script>
			{/* useSearchParams는 Suspense 경계를 요구한다. */}
			<Suspense fallback={null}>
				<PageViewTracker />
			</Suspense>
		</>
	);
}
