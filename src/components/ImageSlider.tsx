import React, { useEffect, useRef, useState } from "react";

interface ImageSliderProps {
	images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {
	const [currentIndex, setCurrentIndex] = useState(1);
	const sliderRef = useRef<HTMLDivElement>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const startX = useRef(0);
	const scrollLeft = useRef(0);

	useEffect(() => {
		intervalRef.current = setInterval(() => {
			nextImage();
		}, 3000);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (sliderRef.current) {
			const handleTransitionEnd = () => {
				if (currentIndex === 0) {
					if (sliderRef.current) {
						sliderRef.current.style.transition = "none";
						setCurrentIndex(images.length);
					}
				} else if (currentIndex === images.length + 1) {
					if (sliderRef.current) {
						sliderRef.current.style.transition = "none";
						setCurrentIndex(1);
					}
				}
			};

			sliderRef.current.addEventListener("transitionend", handleTransitionEnd);
			return () => {
				if (sliderRef.current) {
					sliderRef.current.removeEventListener(
						"transitionend",
						handleTransitionEnd
					);
				}
			};
		}
	}, [currentIndex, images.length]);

	const nextImage = () => {
		setCurrentIndex((prevIndex) => prevIndex + 1);
	};

	const prevImage = () => {
		setCurrentIndex((prevIndex) => prevIndex - 1);
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
		if (sliderRef.current) {
			const diff = startX.current - (sliderRef.current.scrollLeft ?? 0);
			if (Math.abs(diff) > 50) {
				if (diff > 0) {
					nextImage();
				} else {
					prevImage();
				}
			}
		}
	};

	return (
		<div className="relative w-full h-[400px] overflow-hidden flex justify-center">
			<div
				className="flex transition-transform duration-300 ease-in-out"
				style={{
					transform: `translateX(-${currentIndex * 100}%)`,
					width: `${(images.length + 2) * 100}%`,
				}}
				ref={sliderRef}
				onMouseDown={handleMouseDown}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				<div className="w-full flex-shrink-0 flex justify-center items-center bg-gray-200">
					<img
						src={images[images.length - 1]}
						alt={`Slide ${images.length}`}
						className="max-w-full max-h-full object-contain"
						style={{ width: "350px", height: "350px" }}
					/>
				</div>
				{images.map((image, index) => (
					<div
						key={index}
						className="w-full flex-shrink-0 flex justify-center items-center bg-gray-200"
					>
						<img
							src={image}
							alt={`Slide ${index}`}
							className="max-w-full max-h-full object-contain"
							style={{ width: "350px", height: "350px" }}
						/>
					</div>
				))}
				<div className="w-full flex-shrink-0 flex justify-center items-center bg-gray-200">
					<img
						src={images[0]}
						alt={`Slide 0`}
						className="max-w-full max-h-full object-contain"
						style={{ width: "350px", height: "350px" }}
					/>
				</div>
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
