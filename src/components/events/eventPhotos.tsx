// components/eventPhotos.tsx
import { useState } from "react";
import Image from "next/image";
import LoadingSpinner from "@/components/shared/loadingSpinner";

interface EventPhotosProps {
	eventId: string;
	eventPhotos: string[];
	loadingPhotos: boolean;
	loadMorePhotos: () => void;
	totalPages: number;
	page: number;
	eventTitle: string;
	openModal: (photo: string) => void;
}

const EventPhotos: React.FC<EventPhotosProps> = ({
	eventId,
	eventPhotos,
	loadingPhotos,
	loadMorePhotos,
	totalPages,
	page,
	eventTitle,
	openModal,
}) => {
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const handleLoadMore = async () => {
		setIsLoadingMore(true); // 전역 로딩 상태 설정
		await loadMorePhotos();
		setIsLoadingMore(false); // 전역 로딩 상태 해제
	};

	return (
		<div className="lg:w-1/3 mt-4 lg:mt-0 max-h-[600px] overflow-y-auto scrollbar-hide">
			{loadingPhotos && eventPhotos.length === 0 ? (
				<div className="flex justify-center items-center">
					<p>잠시만요...</p>
				</div>
			) : eventPhotos.length > 0 ? (
				<div className="grid grid-cols-5 gap-2">
					{eventPhotos.map((photo, index) => (
						<div
							key={index}
							className="relative"
							style={{ paddingBottom: "100%" }}
						>
							<div
								className="absolute top-0 left-0 w-full h-full cursor-pointer"
								onClick={() => openModal(photo)}
							>
								<Image
									src={photo}
									alt={eventTitle}
									layout="fill"
									objectFit="cover"
									className="object-cover"
								/>
							</div>
						</div>
					))}
				</div>
			) : (
				!loadingPhotos && <span>로딩중일거예요..</span>
			)}
			{page < totalPages && !loadingPhotos && (
				<div>
					<button
						onClick={handleLoadMore}
						className="mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded w-full"
						disabled={isLoadingMore}
					>
						{isLoadingMore ? "로딩 중..." : "더보기"}
					</button>
					{isLoadingMore && (
						<div className="flex justify-center items-center mt-4 bg-white bg-opacity-70">
							<LoadingSpinner size={40} fullScreen={false} />
						</div>
					)}
				</div>
			)}
			{page >= totalPages && eventPhotos.length > 0 && (
				<div className="text-center mt-4 text-gray-500">더이상,, 없어요</div>
			)}
			{/* {loadingPhotos && eventPhotos.length > 0 && (
				<div className="flex justify-center items-center mt-4">
					<LoadingSpinner />
				</div>
			)} */}
		</div>
	);
};

export default EventPhotos;
