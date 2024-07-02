"use client";
import { useState, useEffect, useRef } from "react";
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
	const [guestbookEntries, setGuestbookEntries] = useState<GuestBookEntry[]>(
		[]
	);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const observer = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const data = await fetchGuestbookEntries(page, 10);
				setGuestbookEntries((prevEntries) => [...prevEntries, ...data.entries]);
				setHasMore(data.entries.length > 0);
			} catch (error) {
				console.error("Failed to fetch guestbook entries:", error);
			}
			setLoading(false);
		};

		if (hasMore) {
			fetchData();
		}
	}, [page]);

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

	return (
		<div className="p-4 bg-red-300 w-full flex items-start">
			<div className="bg-blue-300 w-full h-[351px] place-items-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-screen overflow-y-auto">
				{guestbookEntries.map((entry, index) => (
					<div
						key={entry._id}
						className="w-[260px] h-[350px] bg-white shadow-md rounded-lg overflow-hidden flex flex-col"
						ref={index === guestbookEntries.length - 1 ? lastEntryRef : null}
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
};

export default GuestBookCardList;
