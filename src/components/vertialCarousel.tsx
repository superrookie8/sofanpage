import React, { useState, useRef } from "react";

interface VerticalCarouselProps {
	photos: string[];
	altText: string;
}

const VerticalCarousel: React.FC<VerticalCarouselProps> = ({
	photos,
	altText,
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [startY, setStartY] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const carouselRef = useRef<HTMLDivElement>(null);

	const handleMouseDown = (e: React.MouseEvent) => {
		setStartY(e.clientY);
		setIsDragging(true);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return;
		const diffY = e.clientY - startY;

		if (carouselRef.current) {
			carouselRef.current.style.transform = `translateY(${
				diffY - currentIndex * 100
			}%)`;
		}
	};

	const handleMouseUp = (e: React.MouseEvent) => {
		setIsDragging(false);
		if (!carouselRef.current) return;

		const diffY = startY - e.clientY;
		if (Math.abs(diffY) > 50) {
			if (diffY > 0) {
				setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
			} else {
				setCurrentIndex(
					(prevIndex) => (prevIndex - 1 + photos.length) % photos.length
				);
			}
		}

		carouselRef.current.style.transform = `translateY(-${currentIndex * 100}%)`;
	};

	return (
		<div
			className="relative w-full h-full overflow-hidden"
			onMouseDown={handleMouseDown}
			onMouseMove={handleMouseMove}
			onMouseUp={handleMouseUp}
			onMouseLeave={handleMouseUp}
		>
			<div
				ref={carouselRef}
				className="w-full h-full flex flex-col transition-transform duration-700 ease-in-out"
				style={{ transform: `translateY(-${currentIndex * 100}%)` }}
			>
				{photos.map((photo, index) => (
					<div key={index} className="w-full h-full flex-shrink-0">
						<img
							src={photo}
							alt={`${altText} - ${index + 1}`}
							className="object-contain w-full h-full"
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default VerticalCarousel;
