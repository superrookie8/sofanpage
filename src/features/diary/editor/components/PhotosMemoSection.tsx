// src/features/diary/editor/components/PhotosMemoSection.tsx
import React from "react";
import { SectionTitle } from "./SectionTitle";
import DiaryPhotoUpload from "@/components/diary/diaryPhotoUpload";

interface PhotosMemoSectionProps {
	ticketPhoto: string;
	viewPhoto: string;
	additionalPhoto: string;
	memo: string;
	onTicketPhotoChange: (r2Key: string) => void;
	onViewPhotoChange: (r2Key: string) => void;
	onAdditionalPhotoChange: (r2Key: string) => void;
	onMemoChange: (memo: string) => void;
}

export const PhotosMemoSection: React.FC<PhotosMemoSectionProps> = ({
	ticketPhoto,
	viewPhoto,
	additionalPhoto,
	memo,
	onTicketPhotoChange,
	onViewPhotoChange,
	onAdditionalPhotoChange,
	onMemoChange,
}) => {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-5">
			<SectionTitle
				icon={<span className="text-xl">📷</span>}
				title="사진 & 메모"
				desc="추억은 사진으로, 마음은 메모로 마무리해요."
			/>

			<div className="mt-5 grid gap-4">
				<div>
					<div className="text-sm text-gray-500 mb-3">사진(선택, 각 1장씩)</div>
					<div className="max-w-[700px] min-w-[700px] mx-auto grid grid-cols-3 sm:grid-cols-1 gap-2">
						<div className="space-y-2 flex flex-col items-center">
							<div className="text-xs text-gray-500 text-center">티켓 사진</div>
							<div className="flex justify-center">
								<DiaryPhotoUpload
									onDiaryPhotoUpload={onTicketPhotoChange}
									type="ticket"
								/>
							</div>
						</div>
						<div className="space-y-2 flex flex-col items-center">
							<div className="text-xs text-gray-500 text-center">
								경기장 사진
							</div>
							<div className="flex justify-center">
								<DiaryPhotoUpload
									onDiaryPhotoUpload={onViewPhotoChange}
									type="view"
								/>
							</div>
						</div>
						<div className="space-y-2 flex flex-col items-center">
							<div className="text-xs text-gray-500 text-center">추가 사진</div>
							<div className="flex justify-center">
								<DiaryPhotoUpload
									onDiaryPhotoUpload={onAdditionalPhotoChange}
									type="additional"
								/>
							</div>
						</div>
					</div>
				</div>

				<div>
					<div className="text-sm text-gray-500">일지 메모</div>
					<textarea
						className="mt-2 w-full min-h-[160px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
						placeholder="그날 기억에 남은 장면, 감정, 누구와 어떤 대화를 했는지… 편하게 적어봐요."
						value={memo}
						onChange={(e) => onMemoChange(e.target.value)}
					/>
				</div>
			</div>
		</div>
	);
};
