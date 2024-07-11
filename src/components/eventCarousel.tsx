import React, { useState } from "react";
import Image from "next/image";

interface EventCarouselProps {
	photos: string[];
	altText: string;
}

const EventCarousel: React.FC<EventCarouselProps> = ({ photos, altText }) => {
	const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

	const handlePhotoClick = (photo: string) => {
		setSelectedPhoto(photo);
	};

	const closeModal = () => {
		setSelectedPhoto(null);
	};

	return (
		<>
			<div className="overflow-x-auto whitespace-nowrap">
				{photos.map((photo, index) => (
					<div
						key={index}
						className="inline-block h-auto max-h-[150px] relative mr-2 cursor-pointer"
						onClick={() => handlePhotoClick(photo)}
					>
						<Image
							src={photo}
							alt={`${altText} ${index + 1}`}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
							style={{ objectFit: "contain" }}
							className="object-contain"
							loading="lazy" // Add lazy loading attribute
							priority={false} // Ensure this is set to false as it conflicts with lazy loading
						/>
					</div>
				))}
			</div>

			{selectedPhoto && (
				<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
					<div className="relative bg-white p-4 rounded">
						<div className="relative max-w-full max-h-[80vh]">
							<Image
								src={selectedPhoto}
								alt="Selected"
								fill
								sizes="100vw"
								style={{ objectFit: "contain" }}
								className="object-contain"
								priority
							/>
						</div>
						<button
							className="absolute top-2 right-2 text-black bg-white rounded-full p-1"
							onClick={closeModal}
						>
							&times;
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default EventCarousel;
