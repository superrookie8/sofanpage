"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface GuestBookEntry {
	_id: string;
	name: string;
	message: string;
	date: string;
	photo_data?: string;
}

const fetchGuestbookEntries = async (): Promise<GuestBookEntry[]> => {
	const response = await fetch("/api/getguestbooks");
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

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await fetchGuestbookEntries();
				setGuestbookEntries(data);
				console.log(data);
			} catch (error) {
				console.error("Failed to fetch guestbook entries:", error);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="p-8 bg-red-300 w-full">
			<div className="bg-blue-300 w-full h-[401px] place-items-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4  h-screen overflow-y-auto">
				{guestbookEntries.map((entry) => (
					<div
						key={entry._id}
						className="w-[260px] h-[400px] bg-white shadow-md rounded-lg overflow-hidden flex flex-col"
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
			</div>
		</div>
	);
};

export default GuestBookCardList;
