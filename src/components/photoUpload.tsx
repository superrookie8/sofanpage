import React, { useRef, ChangeEvent } from "react";
import { useRecoilState } from "recoil";
import { photoPreviewState } from "@/states/photoPreviewState";
import Image from "next/image";

interface PhotoUploadProps {
	onPhotoUpload: (photoUrl: string) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotoUpload }) => {
	const [photoPreview, setPhotoPreview] = useRecoilState<string | null>(
		photoPreviewState
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				setPhotoPreview(base64String);
				onPhotoUpload(base64String);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<div className="relative w-200 h-200 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center cursor-pointer">
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept="image/*"
				className="hidden"
			/>
			{photoPreview ? (
				<div className="w-[350px] h-[300px] relative rounded-lg overflow-hidden">
					<Image
						src={photoPreview}
						alt="Preview"
						fill
						style={{ objectFit: "contain" }}
					/>
				</div>
			) : (
				<div
					onClick={handleUploadClick}
					className="relative flex justify-center items-center text-center space-y-2"
				>
					<svg className="w-[350px] h-[300px] mx-auto"></svg>
					<p className="absolute">사진 업로드</p>
				</div>
			)}
		</div>
	);
};

export default PhotoUpload;
