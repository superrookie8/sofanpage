import Image from "next/image";

interface Props {}

const MainImage: React.FC<Props> = (props) => {
	return (
		<div className="relative h-[400px] w-full sm:w-[500px] sm: h-[200px] ">
			<Image
				src="/images/banner.png"
				alt="Super Sohee"
				fill
				sizes="100vw"
				style={{ objectFit: "contain" }}
				priority
			/>
		</div>
	);
};

export default MainImage;
