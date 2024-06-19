import React, { useEffect, useState } from "react";
import ImageSlider from "./ImageSlider";

interface Photo {
	_id: string;
	filename: string;
	base64: string;
	url: string;
}

const GetPhotos: React.FC = () => {
	const [photos, setPhotos] = useState<Photo[]>([]);

	useEffect(() => {
		const fetchPhotos = async () => {
			try {
				const response = await fetch("/api/getphotos", {
					method: "GET",
					cache: "no-store",
				});
				const data = await response.json();
				if (response.ok) {
					setPhotos(data.admin_photos);

					console.log("data", data);
				} else {
					console.error("Failed to fetch photos", data);
				}
			} catch (error) {
				console.error("Error fetching photos:", error);
			}
		};
		fetchPhotos();
	}, []);

	const imageUrls = photos.map((photo) => photo.base64);

	return (
		<div>{imageUrls.length > 0 && <ImageSlider images={imageUrls} />}</div>
	);
};

export default GetPhotos;
