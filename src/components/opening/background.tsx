"use client";

// src/components/Background.tsx
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const Background: React.FC = () => {
	const pathname = usePathname();
	const isEventPage =
		pathname?.startsWith("/events/5th") || pathname?.startsWith("/events/6th");

	useEffect(() => {
		if (isEventPage) {
			// 이벤트 페이지일 때 body에 bg-white 추가
			document.body.classList.add("bg-white");
			return () => {
				document.body.classList.remove("bg-white");
			};
		}
	}, [isEventPage]);

	// 이벤트 페이지면 Background 컴포넌트 숨기기
	if (isEventPage) {
		return null;
	}
	return (
		<div className="fixed w-full h-full z-0">
			<Image
				src="/images/soheeposter34.png"
				alt="Background"
				fill
				style={{
					objectFit: "contain",
					objectPosition: "center",
					marginTop: "32px",
				}}
				quality={100}
				priority // 페이지 로드 시 백그라운드 이미지를 우선 로드하도록 설정
			/>
		</div>
	);
};

export default Background;
