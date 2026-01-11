"use client";
import { useState } from "react";
import EventDetail from "@/features/events/components/eventDetail";
import EventPhotos from "@/features/events/components/eventPhotos";
import { Event, EventDetails, PhotosResponse } from "@/features/events/types";
import Image from "next/image";
import {
	useEventListQuery,
	useEventDetailQuery,
	useEventPhotosQuery,
} from "@/features/events/queries";

const Events: React.FC = () => {
	const [activeEvent, setActiveEvent] = useState<string | null>(null);
	const [page, setPage] = useState<number>(1);
	const [modalPhoto, setModalPhoto] = useState<string | null>(null);

	// React Query를 사용하여 이벤트 목록 조회
	const { data: events = [], isLoading: eventsLoading } = useEventListQuery();

	// 활성 이벤트의 상세 정보 조회
	const { data: eventDetails, isLoading: loadingDetails } = useEventDetailQuery(
		activeEvent || "",
		!!activeEvent
	);

	// 활성 이벤트의 사진 조회
	const { data: photosData, isLoading: loadingPhotos } = useEventPhotosQuery(
		activeEvent || "",
		page,
		!!activeEvent
	);

	const eventPhotos = photosData?.photos || [];
	const totalPages = photosData?.total_pages || 0;

	const loadMorePhotos = () => {
		if (page < totalPages) {
			setPage((prevPage) => prevPage + 1);
		}
	};

	const toggleEvent = (eventId: string) => {
		if (activeEvent === eventId) {
			setActiveEvent(null);
			setPage(1);
			return;
		}
		setActiveEvent(eventId);
		setPage(1);
	};

	const openModal = (photo: string) => {
		setModalPhoto(photo);
	};

	const closeModal = () => {
		setModalPhoto(null);
	};

	const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			closeModal();
		}
	};

	return (
		<div>
			<div className="flex justify-center items-center bg-black bg-opacity-75">
				<div className="min-h-screen w-full flex flex-col justify-center p-8 relative">
					<div className="w-full max-w-[1200px] mx-auto">
						{events.map((event) => (
							<div key={event.id} className="mb-4">
								<button
									onClick={() => toggleEvent(event.id)}
									className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded mb-2"
								>
									{event.title}
								</button>
								{activeEvent === event.id && (
									<div className="bg-white p-4 rounded shadow-md flex flex-col lg:flex-row lg:space-x-4">
										<EventDetail
											eventDetails={eventDetails}
											loadingDetails={loadingDetails}
										/>
										<EventPhotos
											eventId={event.id}
											eventPhotos={eventPhotos}
											loadingPhotos={loadingPhotos}
											loadMorePhotos={loadMorePhotos}
											totalPages={totalPages}
											page={page}
											eventTitle={eventDetails?.title || ""}
											openModal={openModal}
										/>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
			{modalPhoto && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
					onClick={handleOutsideClick}
				>
					<div
						className="relative bg-gray-200 p-4 rounded-lg shadow-xl flex justify-center items-center"
						style={{ maxWidth: "90vw", maxHeight: "90vh" }}
					>
						<button
							className="absolute top-2 right-2 text-black text-xl font-bold"
							onClick={closeModal}
						>
							&times;
						</button>
						<div
							className="relative flex justify-center items-center mx-auto px-4"
							style={{
								backgroundColor: "transparent",
								width: "500px",
								height: "500px",
								maxHeight: "calc(90vh - 2rem)",
							}}
						>
							<Image
								src={modalPhoto}
								alt="Modal"
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
								style={{ objectFit: "contain" }}
								priority
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Events;
