// src/components/Background.tsx
import Image from "next/image";

const Background: React.FC = () => {
	return (
		<div className="fixed top-0 left-0 w-full h-full z-0">
			<Image
				src="/images/supersohee.png"
				alt="Background"
				layout="fill"
				objectFit="contain"
				quality={100}
				className="object-contain"
				priority // 페이지 로드 시 백그라운드 이미지를 우선 로드하도록 설정
			/>
		</div>
	);
};

export default Background;
