import { useState } from "react";
import Image from "next/image";

interface ImageCarouselProps {
	images: string[];
}

const Carousel: React.FC<ImageCarouselProps> = ({ images }) => {
	const [picture, setPicture] = useState(0);

	const nextImage = () => {
		setPicture((prevIndex) => (prevIndex + 1) % images.length);
	};

	const prevImage = () => {
		setPicture((prevIndex) => (prevIndex - 1 + images.length) % images.length);
	};
	return (
		<div className="bg-white w-[500px] h-[500px] flex justify-center items-center">
			<button onClick={prevImage} className="mr-[10px]">
				Prev
			</button>
			<div className="bg-gray-500 h-[400px] w-[400px] flex justify-center items-center relative">
				<Image
					src={images[picture]}
					alt="Carousel image"
					layout="fill"
					objectFit="contain"
				/>
			</div>
			<button onClick={nextImage} className="ml-[10px]">
				Next
			</button>
		</div>
	);
};

export default Carousel;
