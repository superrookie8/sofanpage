"use client";

import React, { useEffect, useRef, useState } from "react";
import useAdminAuth from "@/hooks/useAdminAuth";
import EventList from "@/components/admin/GetEvents";
import {
	canonicalEventFormData,
	canonicalEventUpdateFormData,
	emptyEventDraft,
	EVENT_PHOTO_ACCEPT,
	eventDraftFromItem,
	EventFormValidationError,
	prepareEventPhotosSequentially,
	safeEventErrorMessage,
} from "@/lib/admin/events";
import type { AdminEventListItem, EventDraft } from "@/lib/admin/events";

const ManageEvents: React.FC = () => {
	useAdminAuth();
	const [newEvent, setNewEvent] = useState<EventDraft>(() => emptyEventDraft());
	const [editingEventId, setEditingEventId] = useState<string | null>(null);
	const [showUrlField, setShowUrlField] = useState<boolean>(false);
	const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
	const [photoError, setPhotoError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [converting, setConverting] = useState(false);
	const [conversionProgress, setConversionProgress] = useState("");
	const [eventListKey, setEventListKey] = useState(0);
	const conversionController = useRef<AbortController | null>(null);
	const formHeadingRef = useRef<HTMLHeadingElement | null>(null);
	const submittingRef = useRef(false);

	useEffect(() => () => conversionController.current?.abort(), []);

	const resetForm = () => {
		conversionController.current?.abort();
		conversionController.current = null;
		setNewEvent(emptyEventDraft());
		setEditingEventId(null);
		setShowUrlField(false);
		setSelectedPhotos([]);
		setPhotoError(null);
		setConversionProgress("");
		setConverting(false);
	};

	const handleEdit = (event: AdminEventListItem) => {
		conversionController.current?.abort();
		conversionController.current = null;
		setNewEvent(eventDraftFromItem(event));
		setEditingEventId(event._id);
		setShowUrlField(true);
		setSelectedPhotos([]);
		setPhotoError(null);
		setMessage(null);
		setConversionProgress("");
		setConverting(false);
		requestAnimationFrame(() => formHeadingRef.current?.focus());
	};

	const cancelEdit = () => {
		resetForm();
		setMessage("이벤트 수정을 취소했습니다.");
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		if (name.startsWith("check_")) {
			setNewEvent((prevState) => ({
				...prevState,
				checkFields: { ...prevState.checkFields, [name]: value },
			}));
		} else {
			setNewEvent((prevState) => ({ ...prevState, [name]: value }));
		}
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		e.target.value = "";
		conversionController.current?.abort();
		const controller = new AbortController();
		conversionController.current = controller;
		setSelectedPhotos([]);
		setPhotoError(null);
		setMessage(null);
		setConverting(true);
		try {
			const prepared = await prepareEventPhotosSequentially(files, {
				signal: controller.signal,
				onProgress: ({ completed, total, filename }) => {
					setConversionProgress(
						completed === total
							? "사진 변환 완료"
							: `사진 변환 중 (${completed + 1}/${total}) ${filename}`
					);
				},
			});
			if (!controller.signal.aborted) setSelectedPhotos(prepared);
		} catch (error) {
			if (!(error instanceof DOMException && error.name === "AbortError")) {
				setPhotoError(
					error instanceof EventFormValidationError
						? error.message
						: "사진을 WebP로 변환하지 못했습니다. 다른 파일을 선택해 주세요."
				);
			}
		} finally {
			if (conversionController.current === controller) {
				conversionController.current = null;
				setConverting(false);
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setMessage(null);
		if (photoError || converting || submittingRef.current) return;
		submittingRef.current = true;
		setSubmitting(true);

		try {
			const isEditing = editingEventId !== null;
			const input = new FormData();
			input.append("title", newEvent.title);
			if (showUrlField || isEditing) input.append("url", newEvent.url);
			input.append("description", newEvent.description);
			Object.entries(newEvent.checkFields).forEach(([key, value]) => input.append(key, value));
			input.append("isActive", String(newEvent.isActive));
			selectedPhotos.forEach((file) => input.append("photos", file, file.name));
			const formData = isEditing
				? canonicalEventUpdateFormData(input)
				: canonicalEventFormData(input);
			const response = await fetch(
				isEditing ? `/api/admin/events/${encodeURIComponent(editingEventId)}` : "/api/admin/postevents",
				{
				method: isEditing ? "PUT" : "POST",
				body: formData,
				}
			);
			const data = await response.json().catch(() => null);

			if (response.ok) {
				resetForm();
				setMessage(isEditing ? "이벤트 수정을 저장했습니다." : "이벤트와 사진을 등록했습니다.");
				setEventListKey((value) => value + 1);
			} else {
				setPhotoError(safeEventErrorMessage(
					data,
					isEditing
						? "이벤트 수정을 저장하지 못했습니다. 입력값과 사진 형식을 확인해 주세요."
						: "이벤트를 등록하지 못했습니다. 입력값과 사진 형식을 확인해 주세요."
				));
			}
		} catch (error) {
			setPhotoError(
				error instanceof EventFormValidationError
					? error.message
					: editingEventId
						? "이벤트 수정을 저장하는 중 오류가 발생했습니다."
						: "이벤트를 등록하는 중 오류가 발생했습니다."
			);
		} finally {
			submittingRef.current = false;
			setSubmitting(false);
		}
	};

	const addCheckField = () => {
		if (Object.keys(newEvent.checkFields).length >= 3) return;
		const newField = `check_${Object.keys(newEvent.checkFields).length + 1}`;
		setNewEvent((prevState) => ({
			...prevState,
			checkFields: { ...prevState.checkFields, [newField]: "" },
		}));
	};

	const removeCheckField = () => {
		if (Object.keys(newEvent.checkFields).length > 1) {
			const newCheckFields = { ...newEvent.checkFields };
			delete newCheckFields[
				`check_${Object.keys(newEvent.checkFields).length}`
			];
			setNewEvent((prevState) => ({
				...prevState,
				checkFields: newCheckFields,
			}));
		}
	};

	const toggleUrlField = () => {
		if (showUrlField) setNewEvent((current) => ({ ...current, url: "" }));
		setShowUrlField(!showUrlField);
	};

	const removeSelectedPhoto = (photoIndex: number) => {
		setSelectedPhotos((photos) => photos.filter((_, index) => index !== photoIndex));
	};

	return (
		<div className="container mx-auto">
			<form
				onSubmit={handleSubmit}
				className={`mb-8 rounded-lg border p-5 ${editingEventId ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
			>
				<h2 ref={formHeadingRef} tabIndex={-1} className="mb-4 text-xl font-bold outline-none">
					{editingEventId ? "이벤트 수정" : "새 이벤트 등록"}
				</h2>
				<div className="mb-4">
					<label className="block text-gray-700">Title</label>
					<input
						type="text"
						name="title"
						value={newEvent.title}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2"
						required
					/>
				</div>
				<button
					type="button"
					onClick={toggleUrlField}
					className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
				>
					{showUrlField ? "Remove URL" : "Add URL"}
				</button>
				{showUrlField && (
					<div className="mb-4">
						<label className="block text-gray-700">URL</label>
						<input
							type="text"
							name="url"
							value={newEvent.url}
							onChange={handleChange}
							className="w-full border rounded px-3 py-2"
						/>
					</div>
				)}
				<div className="mb-4">
					<label className="block text-gray-700">Description</label>
					<textarea
						name="description"
						value={newEvent.description}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2"
					/>
				</div>
				{Object.keys(newEvent.checkFields).map((field, index) => (
					<div key={index} className="mb-4">
						<label className="block text-gray-700">Check {index + 1}</label>
						<input
							type="text"
							name={field}
							value={(newEvent.checkFields as any)[field] || ""}
							onChange={handleChange}
							className="w-full border rounded px-3 py-2"
						/>
					</div>
				))}
				<div className="flex mb-4">
					<button
						type="button"
						onClick={addCheckField}
						disabled={Object.keys(newEvent.checkFields).length >= 3}
						className="mr-4 bg-green-500 text-white px-4 py-2 rounded"
					>
						Add Check Field
					</button>
					<button
						type="button"
						onClick={removeCheckField}
						className="bg-red-500 text-white px-4 py-2 rounded"
					>
						Delete Check Field
					</button>
				</div>
				<label className="mb-4 flex items-center gap-2 text-gray-700">
					<input
						type="checkbox"
						checked={newEvent.isActive}
						onChange={(event) => setNewEvent((current) => ({ ...current, isActive: event.target.checked }))}
					/>
					공개 상태로 표시
				</label>
				<div className="mb-4">
					<label className="block text-gray-700">Image</label>
					<input
						type="file"
						name="photos"
						accept={EVENT_PHOTO_ACCEPT}
						onChange={handleImageChange}
						disabled={submitting}
						multiple
						id="photos"
						className="w-full border rounded px-3 py-2"
					/>
					<p className="mt-1 text-sm text-gray-600">JPG, JPEG, PNG, WebP는 자동 WebP 변환 · GIF는 원본 유지 · 결과 파일당 5MB 이하</p>
					<p className="mt-1 text-sm text-gray-600">HEIC/HEIF는 JPG, PNG 또는 WebP로 변환한 뒤 선택해 주세요.</p>
					{converting && <p className="mt-1 text-sm text-blue-700" role="status">{conversionProgress}</p>}
					{selectedPhotos.length > 0 && (
						<ul className="mt-2 space-y-1 text-sm text-gray-700" aria-label="새로 추가할 사진">
							{selectedPhotos.map((file, photoIndex) => (
								<li key={`${file.name}-${file.lastModified}-${photoIndex}`} className="flex items-center gap-2">
									<span>{file.name}</span>
									<button
										type="button"
										onClick={() => removeSelectedPhoto(photoIndex)}
										disabled={submitting}
										aria-label={`${file.name} 새 사진 제외`}
										className="rounded border border-red-400 px-2 py-0.5 text-red-700 disabled:opacity-40"
									>
										제외
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
				<div className="flex gap-2">
					<button
						type="submit"
						disabled={submitting || converting || Boolean(photoError)}
						className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-40"
					>
						{submitting ? "저장 중..." : editingEventId ? "수정 저장" : "Add Event"}
					</button>
					{editingEventId && (
						<button
							type="button"
							onClick={cancelEdit}
							disabled={submitting}
							className="rounded border border-gray-400 px-4 py-2 text-gray-700 disabled:opacity-40"
						>
							취소
						</button>
					)}
				</div>
				{photoError && <p className="mt-2 text-red-600" role="alert">{photoError}</p>}
				{message && <p className="mt-2 text-green-600" role="status">{message}</p>}
			</form>
			<EventList key={eventListKey} onEdit={handleEdit} editingEventId={editingEventId} />
		</div>
	);
};

export default ManageEvents;
