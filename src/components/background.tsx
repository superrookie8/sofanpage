// src/components/Background.tsx
import Image from "next/image";

const Background: React.FC = () => {
	return (
		<div className="fixed w-full h-full z-0">
			<Image
				src="/images/soheeposter34.png"
				alt="Background"
				fill
				style={{
					objectFit: "contain",
					objectPosition: "top",
					marginTop: "32px",
				}}
				quality={100}
				priority // 페이지 로드 시 백그라운드 이미지를 우선 로드하도록 설정
			/>
		</div>
	);
};

export default Background;
