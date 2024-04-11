"use client";
import { useRef, ChangeEvent } from "react";
import { useRecoilState } from "recoil";
import { photoPreviewState } from "@/states/photoPreviewState";
import Image from "next/legacy/image";

const PhotoUpload: React.FC = () => {
	const [photoPreview, setPhotoPreview] = useRecoilState<string | null>(
		photoPreviewState
	);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const previewUrl = URL.createObjectURL(file);
			setPhotoPreview(previewUrl);
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
				className="hidden" // Tailwind CSS에서는 `display: none;`을 `hidden` 클래스로 적용합니다.
			/>
			{photoPreview ? (
				<div className="w-[350px] h-[300px] relative rounded-lg overflow-hidden">
					<Image
						src={photoPreview}
						alt="Preview"
						layout="fill"
						objectFit="contain"
					/>
				</div>
			) : (
				<div
					onClick={handleUploadClick}
					className=" relative flex justify-center items-center text-center space-y-2"
				>
					{/* SVG 아이콘 및 텍스트 */}
					<svg
						className="w-[350px] h-[300px] mx-auto" /* SVG 내용 생략 */
					></svg>
					<p className="absolute">사진 업로드</p>
				</div>
			)}
		</div>
	);
};

export default PhotoUpload;
