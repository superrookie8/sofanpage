// components/eventPhotos.tsx
import Image from "next/image";

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
	return (
		<div className="lg:w-1/3 mt-4 lg:mt-0 max-h-[600px] overflow-y-auto">
			{loadingPhotos && eventPhotos.length === 0 ? (
				<div className="flex justify-center items-center">
					<p>Loading...</p>
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
				!loadingPhotos && <span>No photos</span>
			)}
			{page < totalPages && !loadingPhotos && (
				<button
					onClick={loadMorePhotos}
					className="mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded w-full"
				>
					Load More Photos
				</button>
			)}
			{loadingPhotos && eventPhotos.length > 0 && (
				<div className="flex justify-center items-center mt-4">
					<p>Loading more photos...</p>
				</div>
			)}
		</div>
	);
};

export default EventPhotos;
