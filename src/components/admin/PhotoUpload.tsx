"use client";
import { useRef, ChangeEvent, useState } from "react";
import { useRecoilState } from "recoil";
import { photoPreviewState } from "@/states/photoPreviewState";
import Image from "next/legacy/image";
import imageCompression from "browser-image-compression";
import useAdminAuth from "@/hooks/useAdminAuth";
import AdminHomeButton from "./AdminHomeButton";

interface PhotoData {
	id: string;
	preview: string;
	originalFile: File;
	compressedFile: File;
	uploadTime: string;
}

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_COUNT = 30;
const PREVIEW_MAX_WIDTH = 360;
const UPLOAD_MAX_WIDTH = 500;

const AdminPhotoUpload: React.FC = () => {
	useAdminAuth();
	const [photoPreviews, setPhotoPreviews] =
		useRecoilState<PhotoData[]>(photoPreviewState);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		setError(null);
		setMessage(null);
		const files = event.target.files;
		if (files) {
			const newPhotos: PhotoData[] = [];
			const currentPhotoCount = photoPreviews.length;

			if (currentPhotoCount + files.length > MAX_FILE_COUNT) {
				setError(`You can upload a maximum of ${MAX_FILE_COUNT} files.`);
				return;
			}

			for (const file of Array.from(files)) {
				if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
					setError(`Each file must be smaller than ${MAX_FILE_SIZE_MB} MB.`);
					continue;
				}

				// Compress the image for preview
				const previewFile = await imageCompression(file, {
					maxSizeMB: 0.2,
					maxWidthOrHeight: PREVIEW_MAX_WIDTH,
					useWebWorker: true,
				});
				const preview = URL.createObjectURL(previewFile);

				// Compress the image for upload
				const uploadFile = await imageCompression(file, {
					maxSizeMB: 0.2,
					maxWidthOrHeight: UPLOAD_MAX_WIDTH,
					useWebWorker: true,
				});

				newPhotos.push({
					id: crypto.randomUUID(), // 고유 ID 생성
					preview,
					originalFile: file,
					compressedFile: uploadFile,
					uploadTime: new Date().toISOString(), // 업로드 시간
				});
			}
			setPhotoPreviews((prevPhotos) => [...prevPhotos, ...newPhotos]);
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleUploadSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setMessage(null);
		setUploading(true);

		try {
			const formData = new FormData();
			photoPreviews.forEach((photo) => {
				formData.append(
					`photos`,
					photo.compressedFile,
					photo.originalFile.name
				);
			});

			const response = await fetch("/api/admin/photos", {
				method: "POST",
				body: formData,
			});

			if (response.ok) {
				setMessage("사진을 업로드했습니다.");
				photoPreviews.forEach((photo) => URL.revokeObjectURL(photo.preview));
				setPhotoPreviews([]); // Clear previews after successful upload
			} else {
				const data = await response.json().catch(() => null) as { message?: string } | null;
				setError(data?.message || "사진 업로드에 실패했습니다.");
			}
		} catch (error) {
			console.error("Error uploading photos:", error);
			setError("사진을 업로드하는 중 오류가 발생했습니다.");
		} finally {
			setUploading(false);
		}
	};

	return (
		<div>
			<div
				className="relative w-200 h-200 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center cursor-pointer"
				onClick={handleUploadClick}
			>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileChange}
					accept="image/*"
					multiple
					className="hidden"
				/>
				{photoPreviews && photoPreviews.length > 0 ? (
					<div className="grid grid-cols-3 gap-4">
						{photoPreviews.map((photo, index) => (
							<div
								key={photo.id}
								className="w-[100px] h-[100px] relative rounded-lg overflow-hidden"
							>
								<Image
									src={photo.preview}
									alt={`Preview ${index}`}
									layout="fill"
									objectFit="contain"
								/>
							</div>
						))}
					</div>
				) : (
					<div className="relative flex justify-center items-center text-center space-y-2">
						<svg className="w-[350px] h-[300px] mx-auto"></svg>
						<p className="absolute">사진 업로드</p>
					</div>
				)}
			</div>
			<AdminHomeButton />
			{photoPreviews && photoPreviews.length > 0 && (
				<button
					onClick={handleUploadSubmit}
					disabled={uploading}
					className="mt-4 py-2 px-4 bg-blue-500 text-white rounded"
				>
					{uploading ? "업로드 중..." : "Upload Photos"}
				</button>
			)}
			{message && <p className="mt-2 text-green-500">{message}</p>}
			{error && <p className="mt-2 text-red-500">{error}</p>}
		</div>
	);
};

export default AdminPhotoUpload;
