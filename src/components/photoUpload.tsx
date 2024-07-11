import React, { useRef, ChangeEvent } from "react";
import { useRecoilState } from "recoil";
import { photoPreviewState, PhotoData } from "@/states/photoPreviewState";
import Image from "next/image";

interface PhotoUploadProps {
	onPhotoUpload: (photoUrl: string) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoUpload }) => {
	const [photos, setPhotos] = useRecoilState(photoPreviewState);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				const newPhoto: PhotoData = {
					id: new Date().toISOString(),
					preview: base64String,
					originalFile: file,
					compressedFile: file, // 여기서는 원본 파일을 사용, 압축 처리는 필요에 따라 추가
					uploadTime: new Date().toISOString(),
				};
				setPhotos([newPhoto]); // 이전 사진 대신 새 사진을 추가하여 상태를 업데이트합니다.
				onPhotoUpload(base64String);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const latestPhoto = photos[photos.length - 1]?.preview || null;

	return (
		<div className="relative w-200 h-200 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center cursor-pointer">
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept="image/*"
				className="hidden"
			/>
			{latestPhoto ? (
				<div className="w-[350px] h-[300px] relative rounded-lg overflow-hidden">
					<Image
						src={latestPhoto}
						alt="Preview"
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 350px"
						style={{ objectFit: "contain" }}
					/>
				</div>
			) : (
				<div
					onClick={handleUploadClick}
					className="relative flex justify-center items-center text-center space-y-2"
				>
					<svg className="w-[350px] h-[300px] mx-auto"></svg>
					<p className="absolute text-white">사진 업로드 (클릭)</p>
				</div>
			)}
		</div>
	);
};

export default PhotoUpload;
