import React, { useEffect, useRef, useState } from "react";

interface ImageSliderProps {
	images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const sliderRef = useRef<HTMLDivElement>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const startX = useRef(0);
	const scrollLeft = useRef(0);

	useEffect(() => {
		intervalRef.current = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
		}, 3000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [images.length]);

	const nextImage = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
	};

	const prevImage = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + images.length) % images.length
		);
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		startX.current = e.pageX;
		scrollLeft.current = sliderRef.current?.scrollLeft ?? 0;
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (sliderRef.current) {
			const x = e.pageX - startX.current;
			sliderRef.current.scrollLeft = scrollLeft.current - x;
		}
	};

	const handleMouseUp = () => {
		window.removeEventListener("mousemove", handleMouseMove);
		window.removeEventListener("mouseup", handleMouseUp);
	};

	const handleTouchStart = (e: React.TouchEvent) => {
		startX.current = e.touches[0].pageX;
		scrollLeft.current = sliderRef.current?.scrollLeft ?? 0;
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (sliderRef.current) {
			const x = e.touches[0].pageX - startX.current;
			sliderRef.current.scrollLeft = scrollLeft.current - x;
		}
	};

	const handleTouchEnd = () => {
		const diff = startX.current - (sliderRef.current?.scrollLeft ?? 0);
		if (Math.abs(diff) > 50) {
			if (diff > 0) {
				nextImage();
			} else {
				prevImage();
			}
		}
	};

	return (
		<div className="relative w-[1100px] h-[400px] overflow-hidden flex justify-center">
			<div
				className="flex transition-transform duration-300"
				style={{ transform: `translateX(-${(currentIndex * 100) / 3}%)` }}
				ref={sliderRef}
				onMouseDown={handleMouseDown}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
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
