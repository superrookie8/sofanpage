"use client";

import React, { useEffect, useState } from "react";
import useAdminAuth from "@/hooks/useAdminAuth";
import AdminHomeButton from "@/components/admin/\bAdminHomeButton";

interface Photo {
	_id: string;
	filename: string;
	base64: string;
	url: string;
}

const AdminDeletePhotos: React.FC = () => {
	useAdminAuth();
	const [adminPhotos, setAdminPhotos] = useState<Photo[]>([]);
	const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
	const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

	useEffect(() => {
		const fetchPhotos = async () => {
			try {
				const token = sessionStorage.getItem("admin-token");
				const response = await fetch("/api/admin/getphoto", {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					cache: "no-store",
				});
				const data = await response.json();
				if (response.ok) {
					setAdminPhotos(data.admin_photos);
					setUserPhotos(data.user_photos);

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

	const handleSelectPhoto = (id: string) => {
		setSelectedPhotos((prev) => {
			const newSelectedPhotos = new Set(prev);
			if (newSelectedPhotos.has(id)) {
				newSelectedPhotos.delete(id);
			} else {
				newSelectedPhotos.add(id);
			}
			return newSelectedPhotos;
		});
	};

	const handleDeletePhotos = async () => {
		const confirmDelete = confirm("삭제하시겠습니까?");
		if (!confirmDelete) return;

		try {
			const token = sessionStorage.getItem("admin-token");
			const response = await fetch("/api/admin/deletephoto", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ photoIds: Array.from(selectedPhotos) }),
			});

			if (response.ok) {
				setAdminPhotos((prev) =>
					prev.filter((photo) => !selectedPhotos.has(photo._id))
				);
				setUserPhotos((prev) =>
					prev.filter((photo) => !selectedPhotos.has(photo._id))
				);
				setSelectedPhotos(new Set());
			} else {
				const data = await response.json();
				console.error("Failed to delete photos", data);
			}
		} catch (error) {
			console.error("Error deleting photos:", error);
		}
	};

	return (
		<div className="container mx-auto">
			<h1 className="text-2xl mb-4">Delete Photos</h1>
			<h2 className="text-xl mb-2">Admin Photos</h2>
			<div className="grid grid-cols-6 gap-2">
				{adminPhotos.map((photo) => (
					<div key={photo._id} className="relative">
						<img
							src={photo.base64} // Correct URL to fetch the image
							alt={photo.filename}
							className="w-[200px] h-auto"
						/>
						<input
							type="checkbox"
							className="absolute top-2 left-2"
							checked={selectedPhotos.has(photo._id)}
							onChange={() => handleSelectPhoto(photo._id)}
						/>
					</div>
				))}
			</div>
			<h2 className="text-xl mb-2 mt-4">User Photos</h2>
			<div className="grid grid-cols-3 gap-4">
				{userPhotos.map((photo) => (
					<div key={photo._id} className="relative">
						<img
							src={photo.base64} // Correct URL to fetch the image
							alt={photo.filename}
							className="w-full h-auto"
						/>
						<input
							type="checkbox"
							className="absolute top-2 left-2"
							checked={selectedPhotos.has(photo._id)}
							onChange={() => handleSelectPhoto(photo._id)}
						/>
					</div>
				))}
			</div>
			{selectedPhotos.size > 0 && (
				<button
					onClick={handleDeletePhotos}
					className="mt-4 py-2 px-4 bg-red-500 text-white rounded"
				>
					Delete Selected Photos
				</button>
			)}
			<AdminHomeButton />
		</div>
	);
};

export default AdminDeletePhotos;
