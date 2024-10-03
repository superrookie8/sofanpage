import React, { useEffect, useState } from "react";
import ImageGrid from "@/components/shared/imageGrid";
import Image from "next/image";

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
		<div className="w-full p-4 relative">
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
						className="w-full relative bg-white bg-opacity-75 p-4 rounded max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-3xl max-h-[90vh] overflow-auto mx-4 my-8 sm:my-16"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh]">
							<Image
								src={selectedPhoto}
								alt="Selected"
								fill
								style={{ objectFit: "contain" }}
								className="object-contain"
							/>
						</div>
						<button
							className="absolute top-4 right-2 text-black bg-white rounded-full p-1"
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
