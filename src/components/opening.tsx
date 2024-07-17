import Image from "next/image";

interface Props {}

const Opening: React.FC<Props> = (props) => {
	return (
		<div className="relative h-[580px] w-full sm:w-[1000px] md:w-[1100px]">
			<Image
				src="/images/leesohee1920.png"
				alt="Super Sohee"
				fill
				sizes="100vw"
				style={{ objectFit: "cover" }}
				priority
			/>
		</div>
	);
};

export default Opening;
