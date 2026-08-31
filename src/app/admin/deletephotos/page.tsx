"use client";

import React, { useEffect, useState } from "react";
import useAdminAuth from "@/hooks/useAdminAuth";
import AdminHomeButton from "@/components/admin/AdminHomeButton";

interface Photo {
	id: string;
	filename: string;
	contentType: string;
	contentUrl: string;
}

const AdminDeletePhotos: React.FC = () => {
	useAdminAuth();
	const [adminPhotos, setAdminPhotos] = useState<Photo[]>([]);
	const [userPhotos, setUserPhotos] = useState<Photo[]>([]);
	const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
	const [error, setError] = useState<string | null>(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		const fetchPhotos = async () => {
			try {
				const response = await fetch("/api/admin/photos", { cache: "no-store" });
				const data = await response.json().catch(() => null) as {
					adminPhotos?: Photo[];
					userPhotos?: Photo[];
					message?: string;
				} | null;
				if (response.ok) {
					setAdminPhotos(data?.adminPhotos ?? []);
					setUserPhotos(data?.userPhotos ?? []);
				} else {
					setError(data?.message || "사진 목록을 불러오지 못했습니다.");
				}
			} catch (error) {
				console.error("Error fetching photos:", error);
				setError("사진 목록을 불러오는 중 오류가 발생했습니다.");
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
		setError(null);
		setDeleting(true);

		try {
			const response = await fetch("/api/admin/photos", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ photoIds: Array.from(selectedPhotos) }),
			});

			if (response.ok) {
				setAdminPhotos((prev) =>
					prev.filter((photo) => !selectedPhotos.has(photo.id))
				);
				setUserPhotos((prev) =>
					prev.filter((photo) => !selectedPhotos.has(photo.id))
				);
				setSelectedPhotos(new Set());
			} else {
				const data = await response.json().catch(() => null) as { message?: string } | null;
				setError(data?.message || "선택한 사진을 삭제하지 못했습니다.");
			}
		} catch (error) {
			console.error("Error deleting photos:", error);
			setError("사진을 삭제하는 중 오류가 발생했습니다.");
		} finally {
			setDeleting(false);
		}
	};

	return (
		<div className="container mx-auto">
			<h2 className="text-xl mb-2">Admin Photos</h2>
			<div className="grid grid-cols-6 gap-2">
				{adminPhotos.map((photo) => (
					<div key={photo.id} className="relative">
						<img
							src={photo.contentUrl}
							alt={photo.filename}
							className="w-[200px] h-auto"
						/>
						<input
							type="checkbox"
							className="absolute top-2 left-2"
							checked={selectedPhotos.has(photo.id)}
							onChange={() => handleSelectPhoto(photo.id)}
						/>
					</div>
				))}
			</div>
			<h2 className="text-xl mb-2 mt-4">User Photos</h2>
			<div className="grid grid-cols-3 gap-4">
				{userPhotos.map((photo) => (
					<div key={photo.id} className="relative">
						<img
							src={photo.contentUrl}
							alt={photo.filename}
							className="w-full h-auto"
						/>
						<input
							type="checkbox"
							className="absolute top-2 left-2"
							checked={selectedPhotos.has(photo.id)}
							onChange={() => handleSelectPhoto(photo.id)}
						/>
					</div>
				))}
			</div>
			{selectedPhotos.size > 0 && (
				<button
					onClick={handleDeletePhotos}
					disabled={deleting}
					className="mt-4 py-2 px-4 bg-red-500 text-white rounded"
				>
					{deleting ? "삭제 중..." : "Delete Selected Photos"}
				</button>
			)}
			{error && <p className="mt-2 text-red-500">{error}</p>}
			<AdminHomeButton />
		</div>
	);
};

export default AdminDeletePhotos;
