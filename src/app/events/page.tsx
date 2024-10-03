"use client";
import { useEffect, useState } from "react";
import EventDetail from "@/components/events/eventDetail";
import EventPhotos from "@/components/events/eventPhotos";
import { Event, EventDetails, PhotosResponse } from "@/data/events";
import Image from "next/image";

const Events: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [activeEvent, setActiveEvent] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
	const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);
	const [eventDetails, setEventDetails] = useState<
		Record<string, EventDetails>
	>({});
	const [eventPhotos, setEventPhotos] = useState<Record<string, string[]>>({});
	const [page, setPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(0);
	const [modalPhoto, setModalPhoto] = useState<string | null>(null);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await fetch("/api/geteventlist", {
					method: "GET",
					cache: "no-store",
				});
				const data = await response.json();
				if (response.ok) {
					setEvents(data.events);
				} else {
					console.error("Failed to fetch data", data);
				}
			} catch (error) {
				console.error("Error fetching data", error);
			} finally {
				setLoading(false);
			}
		};
		fetchEvents();
	}, []);

	const fetchEventDetails = async (eventId: string) => {
		if (!eventDetails[eventId]) {
			try {
				setLoadingDetails(true);
				const response = await fetch(`/api/geteventdetail?id=${eventId}`, {
					method: "GET",
					cache: "no-store",
				});
				const data = await response.json();
				if (response.ok) {
					setEventDetails((prevDetails) => ({
						...prevDetails,
						[eventId]: data.event,
					}));
				} else {
					console.error("Failed to fetch event details", data);
				}
			} catch (error) {
				console.error("Error fetching event details", error);
			} finally {
				setLoadingDetails(false);
			}
		}
	};

	const fetchEventPhotos = async (eventId: string, page: number) => {
		setLoadingPhotos(true);
		try {
			const response = await fetch(
				`/api/geteventphotos?id=${eventId}&page=${page}`,
				{
					method: "GET",
					cache: "no-store",
				}
			);
			const data: PhotosResponse = await response.json();
			if (response.ok) {
				setEventPhotos((prevPhotos) => ({
					...prevPhotos,
					[eventId]: [...(prevPhotos[eventId] || []), ...data.photos],
				}));
				setTotalPages(data.total_pages);
			} else {
				console.error("Failed to fetch event photos", data);
			}
		} catch (error) {
			console.error("Error fetching event photos", error);
		} finally {
			setLoadingPhotos(false);
		}
	};

	const loadMorePhotos = async (eventId: string) => {
		if (page < totalPages) {
			await fetchEventPhotos(eventId, page + 1);
			setPage((prevPage) => prevPage + 1);
		}
	};

	const toggleEvent = async (eventId: string) => {
		if (activeEvent === eventId) {
			setActiveEvent(null);
			setPage(1); // Reset page when closing event
			return;
		}
		setActiveEvent(eventId);
		if (!eventDetails[eventId]) {
			await fetchEventDetails(eventId);
		}
		if (!eventPhotos[eventId] || eventPhotos[eventId].length === 0) {
			await fetchEventPhotos(eventId, 1);
		}
		setPage(1); // Reset page for new event
	};

	const openModal = (photo: string) => {
		setModalPhoto(photo);
	};

	const closeModal = () => {
		setModalPhoto(null);
	};

	return (
		<div>
			<div className="flex justify-center items-center bg-black bg-opacity-75">
				<div className="min-h-screen w-full flex flex-col justify-center p-8 relative">
					<div className="w-full max-w-[1200px] mx-auto">
						{loading ? (
							<div className="flex justify-center items-center">
								<p>Loading...</p>
							</div>
						) : (
							events.map((event) => (
								<div key={event._id} className="mb-4">
									<button
										onClick={() => toggleEvent(event._id)}
										className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded mb-2"
									>
										{event.title}
									</button>
									{activeEvent === event._id && (
										<div className="bg-white p-4 rounded shadow-md flex flex-col lg:flex-row lg:space-x-4">
											<EventDetail
												eventDetails={eventDetails[event._id]}
												loadingDetails={loadingDetails}
											/>
											<EventPhotos
												eventId={event._id}
												eventPhotos={eventPhotos[event._id] || []}
												loadingPhotos={loadingPhotos}
												loadMorePhotos={() => loadMorePhotos(event._id)}
												totalPages={totalPages}
												page={page}
												eventTitle={eventDetails[event._id]?.title || ""}
												openModal={openModal}
											/>
										</div>
									)}
								</div>
							))
						)}
					</div>
				</div>
			</div>
			{modalPhoto && (
				<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-75 z-50 p-4">
					<div className="relative bg-white p-4 rounded w-full max-h-full md:max-w-3xl md:max-h-[80%] overflow-auto">
						<button
							className="absolute top-2 right-2 bg-white text-black rounded-full p-1"
							onClick={closeModal}
						>
							&times;
						</button>
						<div className="relative w-full h-[50vh] md:h-[60vh]">
							<Image
								src={modalPhoto}
								alt="Modal"
								fill
								sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
								style={{ objectFit: "contain" }}
								priority
								className="object-contain"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Events;
