import React, { useState } from "react";

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
					<img
						key={index}
						src={photo}
						alt={`${altText} ${index + 1}`}
						className="inline-block h-auto max-h-[150px] object-contain mr-2 cursor-pointer"
						onClick={() => handlePhotoClick(photo)}
						loading="lazy" // Add lazy loading attribute
					/>
				))}
			</div>

			{selectedPhoto && (
				<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
					<div className="relative bg-white p-4 rounded">
						<img
							src={selectedPhoto}
							alt="Selected"
							className="max-w-full max-h-[80vh] object-contain"
						/>
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
