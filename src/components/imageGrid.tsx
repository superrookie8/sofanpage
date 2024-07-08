import React, { useState, useEffect } from "react";

interface ImageGridProps {
	initialPhotos: string[];
	totalPhotos: number;
	loadMorePhotos: (page: number) => Promise<string[]>;
	onPhotoClick: (photo: string) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
	initialPhotos,
	totalPhotos,
	loadMorePhotos,
	onPhotoClick,
}) => {
	const [photos, setPhotos] = useState(initialPhotos);
	const [currentPage, setCurrentPage] = useState(1);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setPhotos(initialPhotos);
	}, [initialPhotos]);

	const handleLoadMore = async () => {
		setLoading(true);
		const nextPage = currentPage + 1;
		const newPhotos = await loadMorePhotos(nextPage);
		setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
		setCurrentPage(nextPage);
		setLoading(false);
	};

	return (
		<>
			<div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 p-2">
				{photos.map((photo, index) => (
					<div
						key={index}
						className="w-full h-24 sm:h-32 md:h-48 lg:h-64 xl:h-80 cursor-pointer"
						onClick={() => onPhotoClick(photo)}
					>
						<img
							src={photo}
							alt={`Photo ${index}`}
							className="object-cover w-full h-full"
							loading="lazy"
						/>
					</div>
				))}
			</div>
			{photos.length < totalPhotos && (
				<div className="flex justify-center mt-4">
					<button
						className="bg-red-500 text-white p-2 rounded"
						onClick={handleLoadMore}
						disabled={loading || photos.length >= totalPhotos}
					>
						{loading ? "Loading..." : "↓ Load More"}
					</button>
				</div>
			)}
		</>
	);
};

export default ImageGrid;
