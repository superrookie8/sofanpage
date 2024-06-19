import React, { useRef, useState } from "react";

interface ImageSliderProps {
	images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const sliderRef = useRef<HTMLDivElement>(null);

	const nextImage = () => {
		setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, images.length - 3));
	};

	const prevImage = () => {
		setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		const startX = e.pageX;
		const scrollLeft = sliderRef.current?.scrollLeft ?? 0;

		const handleMouseMove = (e: MouseEvent) => {
			if (sliderRef.current) {
				const x = e.pageX - startX;
				sliderRef.current.scrollLeft = scrollLeft - x;
			}
		};

		const handleMouseUp = () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
	};

	return (
		<div className="relative w-[1100px] h-[400px] overflow-hidden flex justify-center">
			<div
				className="flex transition-transform duration-300"
				style={{ transform: `translateX(-${(currentIndex * 100) / 3}%)` }}
				ref={sliderRef}
				onMouseDown={handleMouseDown}
			>
				{images.map((image, index) => (
					<div
						key={index}
						className="w-1/3 flex-shrink-0 flex justify-center items-center bg-gray-200"
					>
						<img
							src={image}
							alt={`Slide ${index}`}
							className="max-w-full max-h-full object-contain"
							style={{ width: "350px", height: "350px" }}
						/>
					</div>
				))}
			</div>
			<button
				className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-2"
				onClick={prevImage}
			>
				Prev
			</button>
			<button
				className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white p-2"
				onClick={nextImage}
			>
				Next
			</button>
		</div>
	);
};

export default ImageSlider;
