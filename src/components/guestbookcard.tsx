"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { GuestBookEntry } from "@/data/guestbook";

const fetchGuestbookEntries = async (
	page: number,
	pageSize: number
): Promise<{ entries: GuestBookEntry[]; total_entries: number }> => {
	const response = await fetch(
		`/api/getguestbooks?page=${page}&page_size=${pageSize}`
	);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	const data = await response.json();
	return data;
};

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return format(date, "yyyy.MM.dd HH:mm");
};

const GuestBookCardList: React.FC = () => {
	const [activeTab, setActiveTab] = useState("photos");
	const [photoEntries, setPhotoEntries] = useState<GuestBookEntry[]>([]);
	const [noPhotoEntries, setNoPhotoEntries] = useState<GuestBookEntry[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const observer = useRef<IntersectionObserver | null>(null);

	const fetchEntries = async (
		currentPage: number,
		currentTab: string,
		reset: boolean = false
	) => {
		setLoading(true);
		try {
			const data = await fetchGuestbookEntries(currentPage, 10);
			if (currentTab === "photos") {
				const newEntries = data.entries.filter((entry) => entry.photo_data);
				setPhotoEntries((prevEntries) =>
					reset ? newEntries : [...prevEntries, ...newEntries]
				);
				setHasMore(newEntries.length > 0);
			} else {
				const newEntries = data.entries.filter((entry) => !entry.photo_data);
				setNoPhotoEntries((prevEntries) =>
					reset ? newEntries : [...prevEntries, ...newEntries]
				);
				setHasMore(newEntries.length > 0);
			}
		} catch (error) {
			console.error(`Failed to fetch guestbook entries:`, error);
		}
		setLoading(false);
	};

	useEffect(() => {
		// Initialize with photos tab
		fetchEntries(1, "photos", true);
	}, []);

	useEffect(() => {
		if (page === 1) return; // 첫 페이지는 이미 로드되었으므로 건너뜁니다.
		if (hasMore && !loading) {
			fetchEntries(page, activeTab);
		}
	}, [page, activeTab]);

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
		setPage(1);
		setHasMore(true);
		if (tab === "photos") {
			setPhotoEntries([]);
		} else {
			setNoPhotoEntries([]);
		}
		fetchEntries(1, tab, true); // Reset and fetch initial data for new tab
	};

	const lastEntryRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (loading) return;
		if (observer.current) observer.current.disconnect();

		observer.current = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting && hasMore) {
				setPage((prevPage) => prevPage + 1);
			}
		});

		if (lastEntryRef.current) observer.current.observe(lastEntryRef.current);
	}, [loading, hasMore]);

	const renderPhotoEntries = () => (
		<div className="bg-red-300 w-full flex items-start">
			<div className="bg-blue-300 w-full h-[351px] place-items-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto">
				{photoEntries.map((entry, index) => (
					<div
						key={entry._id}
						className="w-[260px] h-[350px] bg-white shadow-md rounded-lg overflow-hidden flex flex-col"
						ref={index === photoEntries.length - 1 ? lastEntryRef : null}
					>
						{entry.photo_data && (
							<div className="relative w-full h-[70%] overflow-hidden">
								<img
									src={`data:image/jpeg;base64,${entry.photo_data}`}
									alt="Guestbook entry"
									className="object-cover w-full h-full"
								/>
							</div>
						)}
						<div className="p-4 flex-1 flex flex-col">
							<div className="flex-1 overflow-y-auto">
								<p className="text-gray-800">{entry.message}</p>
							</div>
							<div className="mt-4 text-gray-500 text-sm">
								{formatDate(entry.date)}
							</div>
						</div>
					</div>
				))}
				{loading && <div className="w-full text-center py-4">Loading...</div>}
			</div>
		</div>
	);

	const renderNoPhotoEntries = () => (
		<div className="bg-red-300 w-full flex items-start">
			<div className="bg-blue-300 w-full h-[350px] overflow-y-auto place-items-center">
				{noPhotoEntries.map((entry, index) => (
					<div
						key={entry._id}
						className="w-full bg-white mt-2 shadow-md rounded-lg overflow-hidden flex flex-col p-4"
						ref={index === noPhotoEntries.length - 1 ? lastEntryRef : null}
					>
						<div className="flex-1 overflow-y-auto">
							<p className="text-gray-800">{entry.message}</p>
						</div>
						<div className="mt-4 text-gray-500 text-sm">
							{formatDate(entry.date)}
						</div>
					</div>
				))}
				{loading && <div className="w-full text-center py-4">Loading...</div>}
			</div>
		</div>
	);

	return (
		<div className="p-4 bg-red-300 w-full flex flex-col">
			{/* 탭 */}
			<div className="flex space-x-4 mb-4">
				<button
					onClick={() => handleTabChange("photos")}
					className={`px-4 py-2 rounded ${
						activeTab === "photos"
							? "bg-blue-500 text-white"
							: "bg-gray-200 text-gray-700"
					}`}
				>
					With Photos
				</button>
				<button
					onClick={() => handleTabChange("noPhotos")}
					className={`px-4 py-2 rounded ${
						activeTab === "noPhotos"
							? "bg-blue-500 text-white"
							: "bg-gray-200 text-gray-700"
					}`}
				>
					Without Photos
				</button>
			</div>

			{/* 탭 내용 */}
			{activeTab === "photos" ? renderPhotoEntries() : renderNoPhotoEntries()}
		</div>
	);
};

export default GuestBookCardList;