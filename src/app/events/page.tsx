"use client";
import Link from "next/link";
import Header from "@/components/Header";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import VerticalCarousel from "@/components/VertialCarousel";

interface Event {
	_id: string;
	title: string;
	url: string;
	description: string;
	checkFields: {
		check_1: string;
		check_2: string;
		check_3: string;
	};
	photos: string[];
}

const Events: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	useAuth();

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await fetch("/api/getevents", {
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
			}
		};
		fetchEvents();
	}, []);

	return (
		<div>
			<Header pathname="" />
			<div className="flex justify-center items-center">
				<div className="bg-red-500 min-h-screen w-full flex justify-center p-8 relative">
					<div className="w-[1200px] h-auto flex flex-col">
						<div className="w-full overflow-x-auto flex flex-col justify-center items-center">
							{events.map((event, index) => (
								<div
									key={index}
									className="flex flex-row justify-center items-center mb-8"
								>
									<div className="bg-white w-[500px] h-[400px] flex flex-col justify-center p-4 mr-4">
										<div className="flex justify-center items-center text-lg font-bold">
											{event.title}
										</div>
										<div
											className="mt-2 mb-4 flex text-center justify-center items-center italic"
											style={{ whiteSpace: "pre-line" }}
										>
											{event.description}
										</div>
										<div className="flex justify-center items-center">
											{event.url ? (
												<Link href={event.url}>
													<button className="w-auto bg-blue-500 text-white font-bold py-2 px-4 rounded">
														{event.title}
													</button>
												</Link>
											) : (
												<span></span>
											)}
										</div>
										<div className="flex justify-center items-center flex-col">
											{event.checkFields.check_1 && (
												<div className="mt-8 ml-2">
													✓{event.checkFields.check_1}
												</div>
											)}
											{event.checkFields.check_2 && (
												<div className="mt-8 ml-2">
													✓{event.checkFields.check_2}
												</div>
											)}
											{event.checkFields.check_3 && (
												<div className="mt-8 ml-2">
													✓{event.checkFields.check_3}
												</div>
											)}
										</div>
									</div>
									<div className="bg-green-200 w-[500px] h-[400px] flex flex-col justify-center items-center">
										{event.photos.length > 0 ? (
											<div className="w-full h-full overflow-hidden">
												<VerticalCarousel
													photos={event.photos}
													altText={event.title}
												/>
											</div>
										) : (
											<span>No photos</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Events;
