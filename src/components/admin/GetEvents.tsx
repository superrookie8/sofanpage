import React, { useCallback, useEffect, useRef, useState } from "react";
import { moveEventIds, safeEventErrorMessage, safeEventOrderErrorMessage } from "@/lib/admin/events";
import type { AdminEventListItem } from "@/lib/admin/events";

type EventListProps = {
	onEdit: (event: AdminEventListItem) => void;
	editingEventId?: string | null;
};

const EventList: React.FC<EventListProps> = ({ onEdit, editingEventId = null }) => {
	const [events, setEvents] = useState<AdminEventListItem[]>([]);
	const [listError, setListError] = useState<string | null>(null);
	const [orderMessage, setOrderMessage] = useState<string | null>(null);
	const [savingOrder, setSavingOrder] = useState(false);
	const savingOrderRef = useRef(false);
	const [eventToDelete, setEventToDelete] = useState<string | null>(null);
	const [photoToDelete, setPhotoToDelete] = useState<{
		eventId: string;
		photoKey: string;
	} | null>(null);

	const fetchEvents = useCallback(async () => {
		const response = await fetch("/api/admin/getevents", {
			method: "GET",
			cache: "no-store",
		});
		const data = await response.json().catch(() => null);
		if (!response.ok || !data || !Array.isArray(data.events)) {
			throw new Error(safeEventErrorMessage(data, "이벤트 목록을 불러오지 못했습니다."));
		}
		setEvents(data.events);
		setListError(null);
	}, []);

	const moveEvent = useCallback(async (eventId: string, direction: "up" | "down") => {
		if (savingOrderRef.current) return;
		const previousEvents = events;
		const currentIds = events.map((event) => event._id);
		const reorderedIds = moveEventIds(currentIds, eventId, direction);
		if (reorderedIds === currentIds) return;
		const byId = new Map(events.map((event) => [event._id, event]));
		const reorderedEvents = reorderedIds
			.map((id) => byId.get(id))
			.filter((event): event is AdminEventListItem => Boolean(event));
		setEvents(reorderedEvents);
		savingOrderRef.current = true;
		setSavingOrder(true);
		setListError(null);
		setOrderMessage(null);
		try {
			const response = await fetch("/api/admin/events/order", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ eventIds: reorderedIds }),
			});
			if (!response.ok) throw new Error(safeEventOrderErrorMessage(response.status));
			await fetchEvents();
			setOrderMessage("이벤트 순서를 저장했습니다.");
		} catch (error) {
			setEvents(previousEvents);
			setListError(error instanceof Error ? error.message : safeEventOrderErrorMessage(500));
		} finally {
			savingOrderRef.current = false;
			setSavingOrder(false);
		}
	}, [events, fetchEvents]);

	const deletePhoto = useCallback(async () => {
		if (!photoToDelete) return;

		const { eventId, photoKey } = photoToDelete;
		try {
			const response = await fetch(`/api/admin/deleventphoto`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ eventId, photoKey }),
			});

			if (response.ok) {
				await fetchEvents(); // 사진 삭제 후 이벤트 목록을 다시 불러옵니다.
			} else {
				console.error("Failed to delete photo");
			}
		} catch (error) {
			console.error("Error deleting photo:", error);
		} finally {
			setPhotoToDelete(null);
		}
	}, [photoToDelete, fetchEvents]);

	const deleteEvent = useCallback(async () => {
		if (!eventToDelete) return;

		try {
			const response = await fetch(`/api/admin/deleteevents`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ eventId: eventToDelete }),
			});

			if (response.ok) {
				await fetchEvents(); // 이벤트 삭제 후 이벤트 목록을 다시 불러옵니다.
			} else {
				console.error("Failed to delete event");
			}
		} catch (error) {
			console.error("Error deleting event:", error);
		} finally {
			setEventToDelete(null);
		}
	}, [eventToDelete, fetchEvents]);

	useEffect(() => {
		fetchEvents().catch((error) => {
			setListError(error instanceof Error ? error.message : "이벤트 목록을 불러오지 못했습니다.");
		});
	}, [fetchEvents]);

	return (
		<div>
			<h2 className="text-xl mb-4">Events List</h2>
			{listError && <p className="mb-3 text-red-600" role="alert">{listError}</p>}
			{orderMessage && <p className="mb-3 text-green-600" role="status">{orderMessage}</p>}
			{events.map((event, eventIndex) => (
				<div
					key={event._id}
					className={`mb-4 rounded border p-4 ${editingEventId === event._id ? "border-blue-500 bg-blue-50" : ""}`}
				>
					<div className="mb-3 flex items-center gap-2 border-b pb-3" aria-label={`${event.title} 순서 변경`}>
						<span className="mr-auto text-sm text-gray-600">표시 순서 {eventIndex + 1}</span>
						<button
							type="button"
							onClick={() => moveEvent(event._id, "up")}
							disabled={savingOrder || eventIndex === 0}
							aria-label={`${event.title} 이벤트 위로 이동`}
							className="rounded border border-blue-500 px-3 py-1 text-sm text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
						>
							위로
						</button>
						<button
							type="button"
							onClick={() => moveEvent(event._id, "down")}
							disabled={savingOrder || eventIndex === events.length - 1}
							aria-label={`${event.title} 이벤트 아래로 이동`}
							className="rounded border border-blue-500 px-3 py-1 text-sm text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
						>
							아래로
						</button>
					</div>
					<h3 className="text-lg font-bold">{event.title}</h3>
					<p className="text-gray-700">{event.description}</p>
					{event.url && (
						<a href={event.url} className="text-blue-500">
							{event.url}
						</a>
					)}
					<ul className="list-disc list-inside">
						{Object.entries(event.checkFields ?? {}).map(([field, value]) => (
							<li key={field}>{value}</li>
						))}
					</ul>
					{event.photos && event.photos.length > 0 && (
						<div className="w-full mt-2 flex overflow-x-auto space-x-2">
							{event.photos.map((photo, photoIndex) => (
								<div
									key={photoIndex}
									className="relative flex-shrink-0"
									style={{ width: "200px", height: "200px" }}
								>
									<img
										src={photo}
										alt={event.title}
										className="object-cover w-full h-full"
										style={{
											maxWidth: "100%",
											maxHeight: "100%",
											objectFit: "contain",
										}}
									/>
									<button
										type="button"
										onClick={() =>
											setPhotoToDelete({ eventId: event._id, photoKey: event.photoKeys?.[photoIndex] ?? "" })
										}
										aria-label={`${event.title} 기존 사진 ${photoIndex + 1} 삭제`}
										className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
									>
										&times;
									</button>
								</div>
							))}
						</div>
					)}
					<div className="mt-3 flex gap-2">
						<button
							type="button"
							onClick={() => onEdit(event)}
							disabled={savingOrder}
							aria-label={`${event.title} 이벤트 수정`}
							className="rounded bg-amber-500 px-4 py-2 text-white disabled:opacity-40"
						>
							수정
						</button>
						<button
							type="button"
							onClick={() => setEventToDelete(event._id)}
							disabled={savingOrder}
							className="rounded bg-red-500 px-4 py-2 text-white disabled:opacity-40"
						>
							Delete Event
						</button>
					</div>
				</div>
			))}

			{/* 사진 삭제 확인 모달 */}
			{photoToDelete && (
				<ConfirmationModal
					message="Are you sure you want to delete this photo?"
					onCancel={() => setPhotoToDelete(null)}
					onConfirm={deletePhoto}
				/>
			)}

			{/* 이벤트 삭제 확인 모달 */}
			{eventToDelete && (
				<ConfirmationModal
					message="Are you sure you want to delete this event and all its photos?"
					onCancel={() => setEventToDelete(null)}
					onConfirm={deleteEvent}
				/>
			)}
		</div>
	);
};

interface ConfirmationModalProps {
	message: string;
	onCancel: () => void;
	onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	message,
	onCancel,
	onConfirm,
}) => {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
			<div className="bg-white p-4 rounded">
				<p>{message}</p>
				<div className="mt-4 flex justify-end space-x-2">
					<button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 bg-red-500 text-white rounded"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};

export default EventList;
