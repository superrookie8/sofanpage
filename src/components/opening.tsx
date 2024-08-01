import Image from "next/image";

interface Props {}

const Opening: React.FC<Props> = (props) => {
	return (
		<div className="relative h-[580px] w-full sm:w-full md:w-full lg:w-[1500px] responsive-image-container">
			<Image
				src="/images/banner.png"
				alt="Super Sohee"
				width={1500}
				height={580}
				sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1500px"
				style={{ objectFit: "contain" }}
				priority
			/>
		</div>
	);
};

export default Opening;
