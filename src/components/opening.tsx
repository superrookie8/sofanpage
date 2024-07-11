import Image from "next/image";

interface Props {}

const Opening: React.FC<Props> = (props) => {
	return (
		<div className="h-[580px] w-auto relative">
			<Image
				src="/images/leesohee1920.png"
				alt="Super Sohee"
				fill
				sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
				style={{ objectFit: "cover" }}
				priority
			/>
		</div>
	);
};

export default Opening;
