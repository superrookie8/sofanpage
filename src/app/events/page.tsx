"use client";
import { useState } from "react";
import EventDetail from "@/features/events/components/eventDetail";
import {
	useEventListQuery,
	useEventDetailQuery,
} from "@/features/events/queries";

const Events: React.FC = () => {
	const [activeEvent, setActiveEvent] = useState<string | null>(null);

	// React Query를 사용하여 이벤트 목록 조회
	const {
		data: events = [],
		isLoading: eventsLoading,
		isError: eventsError,
	} = useEventListQuery();

	// 활성 이벤트의 상세 정보 조회
	const { data: eventDetails, isLoading: loadingDetails } = useEventDetailQuery(
		activeEvent || "",
		!!activeEvent
	);

	const toggleEvent = (eventId: string) => {
		if (activeEvent === eventId) {
			setActiveEvent(null);
			return;
		}
		setActiveEvent(eventId);
	};

	return (
		<div>
			<div className="flex justify-center items-center bg-black bg-opacity-75">
				<div className="min-h-screen w-full flex flex-col justify-center p-8 relative">
					<div className="w-full max-w-[1200px] mx-auto">
						{eventsLoading && (
							<p className="text-center text-white">이벤트를 불러오는 중입니다.</p>
						)}
						{eventsError && (
							<p className="text-center text-white">
								이벤트 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
							</p>
						)}
						{!eventsLoading && !eventsError && events.length === 0 && (
							<p className="text-center text-white">현재 공개된 이벤트가 없습니다.</p>
						)}
						{events.map((event) => (
							<div key={event.id} className="mb-4">
								<button
									onClick={() => toggleEvent(event.id)}
									className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded mb-2"
								>
									{event.title}
								</button>
								{activeEvent === event.id && (
									<div className="bg-white p-4 rounded shadow-md">
										<EventDetail
											eventDetails={eventDetails}
											loadingDetails={loadingDetails}
										/>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Events;
