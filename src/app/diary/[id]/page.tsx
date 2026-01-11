// src/app/diary/[id]/page.tsx
"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useDiaryQuery } from "@/features/diary/queries";
import LoadingSpinner from "@/shared/ui/loadingSpinner";
import AlertModal from "@/shared/ui/alertModal";
import { format } from "date-fns";

export default function DiaryDetailPage() {
	const params = useParams();
	const router = useRouter();
	const diaryId = params?.id as string;

	const { data: diary, isLoading, error } = useDiaryQuery(diaryId);

	const [modalOpen, setModalOpen] = React.useState(false);
	const [modalMessage, setModalMessage] = React.useState("");

	React.useEffect(() => {
		if (error) {
			setModalMessage("일지를 불러오는 중 오류가 발생했습니다.");
			setModalOpen(true);
		}
	}, [error]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner />
			</div>
		);
	}

	if (!diary) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<p className="text-lg mb-4">일지를 찾을 수 없습니다.</p>
					<button
						onClick={() => router.push("/diary/read")}
						className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
					>
						목록으로 돌아가기
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="mx-auto max-w-4xl px-4 py-6">
				<button
					onClick={() => router.back()}
					className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900"
				>
					← 목록으로
				</button>

				<div className="bg-white rounded-lg shadow-md p-6">
					<h1 className="text-2xl font-bold mb-4">직관일지 상세</h1>

					{/* 기본 정보 */}
					<div className="mb-6">
						<h2 className="text-lg font-semibold mb-3">기본 정보</h2>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<span className="text-gray-500">날짜:</span>{" "}
								{diary.date || diary.createdAt
									? format(
											new Date(diary.date || diary.createdAt),
											"yyyy년 MM월 dd일"
									  )
									: "-"}
							</div>
							<div>
								<span className="text-gray-500">관람 유형:</span>{" "}
								{diary.watchType === "DIRECT" ? "직관" : "집관"}
							</div>
							{diary.location && (
								<div>
									<span className="text-gray-500">장소:</span> {diary.location}
								</div>
							)}
							{diary.gameWinner && (
								<div>
									<span className="text-gray-500">결과:</span>{" "}
									{diary.gameWinner === "HOME" ? "승" : "패"}
								</div>
							)}
						</div>
					</div>

					{/* 내용 */}
					{diary.content && (
						<div className="mb-6">
							<h2 className="text-lg font-semibold mb-3">내용</h2>
							<p className="whitespace-pre-wrap">{diary.content}</p>
						</div>
					)}

					{/* 사진 */}
					{diary.photoUrls && diary.photoUrls.length > 0 && (
						<div className="mb-6">
							<h2 className="text-lg font-semibold mb-3">사진</h2>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{diary.photoUrls.map((url, index) => (
									<img
										key={index}
										src={url}
										alt={`일지 사진 ${index + 1}`}
										className="w-full h-48 object-cover rounded-lg"
									/>
								))}
							</div>
						</div>
					)}

					{/* MVP */}
					{diary.mvpPlayerName && (
						<div className="mb-6">
							<h2 className="text-lg font-semibold mb-3">MVP</h2>
							<p>{diary.mvpPlayerName}</p>
						</div>
					)}
				</div>
			</div>

			<AlertModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				message={modalMessage}
			/>
		</div>
	);
}
