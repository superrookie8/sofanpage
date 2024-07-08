import React, { useEffect, useState } from "react";
import ImageGrid from "./imageGrid";

interface Photo {
	_id: string;
	filename: string;
	base64: string;
	url: string;
}

const GetPhotos: React.FC = () => {
	const [initialPhotos, setInitialPhotos] = useState<string[]>([]);
	const [totalPhotos, setTotalPhotos] = useState(0);
	const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
	const pageSize = 10;

	const fetchPhotos = async (page: number) => {
		const response = await fetch(
			`/api/getphotos?page=${page}&page_size=${pageSize}`,
			{
				method: "GET",
				cache: "no-store",
			}
		);
		const data = await response.json();
		if (response.ok) {
			setTotalPhotos(data.total_photos);
			return data.admin_photos.map((photo: Photo) => photo.base64);
		} else {
			console.error("Failed to fetch photos", data);
			return [];
		}
	};

	useEffect(() => {
		const loadInitialPhotos = async () => {
			const initialPage = 1;
			const photos = await fetchPhotos(initialPage);
			setInitialPhotos(photos);
		};
		loadInitialPhotos();
	}, []);

	const handlePhotoClick = (photo: string) => {
		setSelectedPhoto(photo);
	};

	const closeModal = () => {
		setSelectedPhoto(null);
	};

	return (
		<div className="p-4 relative">
			{initialPhotos.length > 0 && (
				<ImageGrid
					initialPhotos={initialPhotos}
					totalPhotos={totalPhotos}
					loadMorePhotos={fetchPhotos}
					onPhotoClick={handlePhotoClick}
				/>
			)}
			{selectedPhoto && (
				<div
					className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
					onClick={closeModal}
				>
					<div
						className="relative bg-white p-4 rounded max-w-3xl max-h-[90vh] overflow-auto"
						onClick={(e) => e.stopPropagation()}
					>
						<img
							src={selectedPhoto}
							alt="Selected"
							className="w-full h-auto object-contain"
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
		</div>
	);
};

export default GetPhotos;
