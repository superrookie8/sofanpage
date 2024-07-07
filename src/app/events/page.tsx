"use client";
import Link from "next/link";
import Header from "@/components/header";
import { useEffect, useState } from "react";
import EventCarousel from "@/components/eventCarousel";

interface Event {
	_id: string;
	title: string;
}

interface EventDetails extends Event {
	url: string;
	description: string;
	checkFields: {
		check_1: string;
		check_2: string;
		check_3: string;
	};
	photos: string[];
}

interface PhotosResponse {
	photos: string[];
	total_pages: number;
	page: number;
	page_size: number;
}

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
		await fetchEventDetails(eventId);
		await fetchEventPhotos(eventId, 1);
		setPage(1); // Reset page for new event
	};

	return (
		<div>
			<Header pathname="" />
			<div className="flex justify-center items-center">
				<div className="bg-red-500 min-h-screen w-full flex flex-col justify-center p-8 relative">
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
										className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded mb-2"
									>
										{event.title}
									</button>
									{activeEvent === event._id && (
										<div className="bg-white p-4 rounded shadow-md">
											{loadingDetails ? (
												<div className="flex justify-center items-center">
													<p>Loading details...</p>
												</div>
											) : (
												eventDetails[event._id] && (
													<>
														<div className="text-lg font-bold">
															{eventDetails[event._id].title}
														</div>
														<div
															className="mt-2 mb-4 italic"
															style={{ whiteSpace: "pre-line" }}
														>
															{eventDetails[event._id].description}
														</div>
														<div className="flex justify-center items-center">
															{eventDetails[event._id].url && (
																<Link href={eventDetails[event._id].url}>
																	<button className="w-auto bg-blue-500 text-white font-bold py-2 px-4 rounded">
																		데뷔 5주년 이벤트 사이트
																	</button>
																</Link>
															)}
														</div>
														<div className="mt-4 flex flex-col items-start">
															{eventDetails[event._id].checkFields.check_1 && (
																<div className="mt-2">
																	✓{" "}
																	{eventDetails[event._id].checkFields.check_1}
																</div>
															)}
															{eventDetails[event._id].checkFields.check_2 && (
																<div className="mt-2">
																	✓{" "}
																	{eventDetails[event._id].checkFields.check_2}
																</div>
															)}
															{eventDetails[event._id].checkFields.check_3 && (
																<div className="mt-2">
																	✓{" "}
																	{eventDetails[event._id].checkFields.check_3}
																</div>
															)}
														</div>
														<div className="mt-4">
															{loadingPhotos ? (
																<div className="flex justify-center items-center">
																	<p>Loading photos...</p>
																</div>
															) : (
																<>
																	{eventPhotos[event._id] &&
																	eventPhotos[event._id].length > 0 ? (
																		<div className="w-full h-auto overflow-hidden">
																			<EventCarousel
																				photos={eventPhotos[event._id]}
																				altText={eventDetails[event._id].title}
																			/>
																			{page < totalPages && (
																				<button
																					onClick={() =>
																						loadMorePhotos(event._id)
																					}
																					className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded"
																				>
																					Load More Photos
																				</button>
																			)}
																		</div>
																	) : (
																		<span>No photos</span>
																	)}
																</>
															)}
														</div>
													</>
												)
											)}
										</div>
									)}
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Events;
