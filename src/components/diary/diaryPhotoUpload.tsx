"use client";
import React, { useRef, ChangeEvent, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import clientAxiosService from "@/lib/client/http/axiosService";

interface PhotoData {
	r2Key: string; // R2 키
	preview: string; // 미리보기용 base64 또는 signed URL
}

interface DiaryPhotoUploadProps {
	onDiaryPhotoUpload: (
		r2Key: string,
		type: "ticket" | "view" | "additional"
	) => void;
	type: "ticket" | "view" | "additional";
}

const DiaryPhotoUpload: React.FC<DiaryPhotoUploadProps> = ({
	onDiaryPhotoUpload,
	type,
}) => {
	const { data: session } = useSession();
	const [photo, setPhoto] = useState<PhotoData | null>(null); // 단일 이미지
	const [uploading, setUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// input 초기화 (같은 파일을 다시 선택할 수 있도록)
		if (inputRef.current) {
			inputRef.current.value = "";
		}

		setUploading(true);

		try {
			// 미리보기를 위한 base64 생성
			const reader = new FileReader();
			reader.onloadend = async () => {
				const base64Preview = reader.result as string;

				// R2에 업로드
				const formData = new FormData();
				formData.append("file", file);

				if (!session?.accessToken) {
					alert("로그인이 필요합니다.");
					setUploading(false);
					return;
				}

				// 디버깅: API 엔드포인트 확인
				console.log("Uploading to: /api/images/upload");
				console.log("File size:", file.size, "bytes");
				console.log("File type:", file.type);

				// clientAxiosService를 사용하면 인터셉터가 자동으로 토큰 추가
				const response = await clientAxiosService.upload("/api/images/upload", formData);

				// 디버깅: 응답 상태 확인
				console.log("Response status:", response.status);
				console.log("Response ok:", response.status === 200);
				console.log("Upload response data:", response.data);

				// 백엔드 응답 형식에 따라 key 또는 다른 필드 확인
				const data = response.data;
				let r2Key: string;
				
				if (typeof data === "string") {
					// HTML이 아닌지 확인
					const lowerData = data.toLowerCase().trim();
					if (
						lowerData.startsWith("<!doctype") ||
						lowerData.startsWith("<html")
					) {
						console.error("R2 key appears to be HTML:", data.substring(0, 200));
						throw new Error(
							"R2 키가 올바르지 않습니다. HTML이 반환되었습니다."
						);
					}
					r2Key = data;
				} else if (data?.key) {
					r2Key = data.key;
				} else if (data?.r2Key) {
					r2Key = data.r2Key;
				} else if (data?.url) {
					r2Key = data.url;
				} else {
					console.error("Unexpected response format:", data);
					throw new Error(
						"서버 응답 형식이 올바르지 않습니다. 응답: " +
							JSON.stringify(data).substring(0, 200)
					);
				}

				// R2 키 유효성 검증
				if (!r2Key || typeof r2Key !== "string") {
					console.error("Invalid r2Key:", r2Key);
					throw new Error("R2 키를 받을 수 없습니다.");
				}

				const lowerR2Key = r2Key.toLowerCase().trim();
				if (
					lowerR2Key.startsWith("<!doctype") ||
					lowerR2Key.startsWith("<html")
				) {
					console.error("R2 key is HTML:", r2Key.substring(0, 200));
					throw new Error("R2 키가 올바르지 않습니다. HTML이 반환되었습니다.");
				}

				// R2 키와 미리보기 저장 (기존 이미지 교체)
				const newPhoto: PhotoData = {
					r2Key: r2Key,
					preview: base64Preview, // 임시로 base64 사용, 나중에 signed URL로 변경 가능
				};

				setPhoto(newPhoto);
				onDiaryPhotoUpload(r2Key, type);
				setUploading(false);
			};

			reader.readAsDataURL(file);
		} catch (error) {
			console.error("이미지 업로드 실패:", error);
			alert(
				error instanceof Error ? error.message : "이미지 업로드에 실패했습니다."
			);
			setUploading(false);
		}
	};

	const handleUploadClick = () => {
		if (!uploading) {
			inputRef.current?.click();
		}
	};

	const handleRemovePhoto = (e: React.MouseEvent) => {
		e.stopPropagation();
		setPhoto(null);
		// 부모 컴포넌트에 빈 배열로 알림 (빈 문자열 전달)
		onDiaryPhotoUpload("", type);
	};

	return (
		<div className="relative w-[200px] h-[200px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center">
			<input
				type="file"
				ref={inputRef}
				onChange={handleFileChange}
				accept="image/*"
				className="hidden"
			/>

			{photo ? (
				<div className="w-full h-full relative rounded-lg overflow-hidden">
					<Image
						src={photo.preview}
						alt={`${type} Preview`}
						fill
						style={{ objectFit: "cover" }}
						className="rounded"
					/>
					<button
						onClick={(e) => handleRemovePhoto(e)}
						className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
					>
						×
					</button>
					{!uploading && (
						<div
							onClick={handleUploadClick}
							className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center cursor-pointer"
						>
							<span className="text-white text-xs opacity-0 hover:opacity-100">
								클릭하여 교체
							</span>
						</div>
					)}
					{uploading && (
						<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
							<p className="text-white text-sm">업로드 중...</p>
						</div>
					)}
				</div>
			) : (
				<div
					onClick={handleUploadClick}
					className="text-center cursor-pointer w-full h-full flex flex-col justify-center items-center"
				>
					{uploading ? (
						<p className="text-gray-500 text-sm">업로드 중...</p>
					) : (
						<>
							<p className="text-black text-sm">
								{type === "ticket"
									? "티켓 사진 업로드 (클릭)"
									: type === "view"
									? "경기장 사진 업로드 (클릭)"
									: "추가 사진 업로드 (클릭)"}
							</p>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default DiaryPhotoUpload;
