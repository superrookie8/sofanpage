import Image from "next/legacy/image";

interface Props {}

const Opening: React.FC<Props> = (props) => {
	return (
		<div className="h-[580px] w-auto relative">
			<Image
				src="/images/leesohee1920.png"
				alt="opening Image"
				layout="fill"
				objectFit="contain"
			/>
		</div>
	);
};

export default Opening;
