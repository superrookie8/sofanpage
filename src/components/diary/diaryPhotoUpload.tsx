import React, { useRef, ChangeEvent } from "react";
import { useRecoilState } from "recoil";
import {
	ticketPreviewState,
	viewPreviewState,
	additionalPreviewState,
	DiaryPhotoData,
} from "@/states/diaryPhotoPreview";
import Image from "next/image";

interface DiaryPhotoUploadProps {
	onDiaryPhotoUpload: (photoUrl: string, type: 'ticket' | 'view' | 'additional') => void;
	type: 'ticket' | 'view' | 'additional'; // Add type prop
}

const DiaryPhotoUpload: React.FC<DiaryPhotoUploadProps> = ({
	onDiaryPhotoUpload,
	type, // Destructure type prop
}) => {
	const [ticketPhoto, setTicketPhoto] = useRecoilState(ticketPreviewState);
	const [viewPhoto, setViewPhoto] = useRecoilState(viewPreviewState);
	const [additionalPhoto, setAdditionalPhoto] = useRecoilState(additionalPreviewState);
	const ticketInputRef = useRef<HTMLInputElement>(null);
	const viewInputRef = useRef<HTMLInputElement>(null);
	const additionalInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, type: 'ticket' | 'view' | 'additional') => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				const newPhoto: DiaryPhotoData = {
					id: new Date().toISOString(),
					preview: base64String,
					originalFile: file,
					compressedFile: file,
					uploadTime: new Date().toISOString(),
					url: base64String
				};
				if (type === 'ticket') {
					setTicketPhoto((prevPhotos) => [...prevPhotos, newPhoto]);
				} else if (type === 'view') {
					setViewPhoto((prevPhotos) => [...prevPhotos, newPhoto]);
				} else if (type === 'additional') {
					setAdditionalPhoto((prevPhotos) => [...prevPhotos, newPhoto]);
				}
				onDiaryPhotoUpload(base64String, type);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUploadClick = () => {
		if (type === 'ticket') ticketInputRef.current?.click();
		else if (type === 'view') viewInputRef.current?.click();
		else if (type === 'additional') additionalInputRef.current?.click();
	};

	const latestPhoto = type === 'ticket' ? ticketPhoto?.[ticketPhoto.length - 1]?.preview :
		type === 'view' ? viewPhoto?.[viewPhoto.length - 1]?.preview :
		additionalPhoto?.[additionalPhoto.length - 1]?.preview;

	return (
		<div className="relative w-[200px] h-[200px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center cursor-pointer"
			onClick={handleUploadClick}>
			<input
				type="file"
				ref={type === 'ticket' ? ticketInputRef : type === 'view' ? viewInputRef : additionalInputRef}
				onChange={(e) => handleFileChange(e, type)}
				accept="image/*"
				className="hidden"
			/>
			{latestPhoto ? (
				<div className="w-full h-full relative rounded-lg overflow-hidden">
					<Image
						src={latestPhoto}
						alt={`${type} Preview`}
						layout="fill"
						objectFit="cover"
					/>
				</div>
			) : (
				<div className="text-center">
					<p className="text-black">{type === 'ticket' ? '티켓 사진 업로드 (클릭)' : type === 'view' ? '경기장 사진 업로드 (클릭)' : '추가 사진 업로드 (클릭)'}</p>
				</div>
			)}
		</div>
	);
};

export default DiaryPhotoUpload;
