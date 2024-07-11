"use client";

import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { GuestBookEntry } from "@/data/guestbook";
import { useRouter } from "next/navigation";

const fetchGuestbookEntries = async (): Promise<{
	photo_entries: GuestBookEntry[];
	no_photo_entries: GuestBookEntry[];
}> => {
	const response = await fetch(`/api/getguestbooks`, {
		headers: {
			Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		},
	});
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

const GuestBookList: React.FC = () => {
	useAuth();
	const [activeTab, setActiveTab] = useState("photos");
	const [photoEntries, setPhotoEntries] = useState<GuestBookEntry[]>([]);
	const [noPhotoEntries, setNoPhotoEntries] = useState<GuestBookEntry[]>([]);
	const [loading, setLoading] = useState(false);
	const [photoPage, setPhotoPage] = useState(1);
	const [noPhotoPage, setNoPhotoPage] = useState(1);
	const pageSize = 10;
	const router = useRouter();

	const fetchEntries = async () => {
		setLoading(true);
		try {
			const data = await fetchGuestbookEntries();
			setPhotoEntries(data.photo_entries);
			setNoPhotoEntries(data.no_photo_entries);
			setLoading(false);
		} catch (error) {
			console.error("Failed to fetch guestbook entries:", error);
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEntries();
	}, []);

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
	};

	const displayEntries =
		activeTab === "photos"
			? photoEntries.slice((photoPage - 1) * pageSize, photoPage * pageSize)
			: noPhotoEntries.slice(
					(noPhotoPage - 1) * pageSize,
					noPhotoPage * pageSize
			  );

	const totalEntries =
		activeTab === "photos" ? photoEntries.length : noPhotoEntries.length;
	const currentPage = activeTab === "photos" ? photoPage : noPhotoPage;
	const setPage = activeTab === "photos" ? setPhotoPage : setNoPhotoPage;

	return (
		<div className="bg-white w-full flex justify-center items-center p-4 rounded-lg shadow-lg">
			<div className="relative p-4 w-full flex flex-col">
				{/* Tabs */}
				<div className="flex justify-between space-x-4 mb-4">
					<div className="flex space-x-2 flex wrap">
						<button
							onClick={() => handleTabChange("photos")}
							className={`px-4 py-2 rounded ${
								activeTab === "photos"
									? "bg-red-500 text-white"
									: "bg-gray-200 text-gray-700"
							}`}
						>
							With Photos
						</button>
						<button
							onClick={() => handleTabChange("noPhotos")}
							className={`px-4 py-2 rounded ${
								activeTab === "noPhotos"
									? "bg-red-500 text-white"
									: "bg-gray-200 text-gray-700"
							}`}
						>
							Without Photos
						</button>
					</div>
					<div className="flex ">
						<button
							onClick={() => {
								router.push("/guestbooks/create");
							}}
							className="border-red-500 border-2 text-red-500 font-bold py-2 px-4 rounded top-4 right-4 hover:bg-red-500 hover:text-white "
						>
							Create
						</button>
					</div>
				</div>

				{/* Tab Content */}
				<div className="w-full min-h-screen flex items-start justify-center">
					<div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-y-auto">
						{displayEntries.map((entry) => (
							<div
								key={entry._id}
								className="w-[260px] h-[350px] bg-white shadow-md rounded-lg overflow-hidden flex flex-col mx-auto"
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
								<div className="flex-1 flex flex-col h-[30%]">
									<div className="bg-red-500 text-white text-sm pl-2">
										{entry.name}
									</div>
									<div className="flex-1 overflow-y-auto">
										<p className="text-gray-800 h-full pl-2">{entry.message}</p>
									</div>
									<div className="text-gray-500 text-sm pl-2">
										{formatDate(entry.date)}
									</div>
								</div>
							</div>
						))}
						{loading && (
							<div className="w-full text-center py-4">Loading...</div>
						)}
					</div>
				</div>

				<div className="flex justify-between mt-4">
					<button
						disabled={currentPage === 1}
						onClick={() => setPage(currentPage - 1)}
						className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
					>
						Previous
					</button>
					<button
						disabled={currentPage * pageSize >= totalEntries}
						onClick={() => setPage(currentPage + 1)}
						className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
};

export default GuestBookList;
