"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { GuestBookEntry } from "@/data/guestbook";
import useAdminAuth from "@/hooks/useAdminAuth";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useRouter } from "next/navigation";

const fetchGuestbookLists = async (
	page: number,
	pageSize: number
): Promise<{ entries: GuestBookEntry[]; total_entries: number }> => {
	const token = sessionStorage.getItem("admin-token");

	if (!token) {
		throw new Error("You are not authorized to perform this action.");
	}

	const response = await fetch(
		`/api/admin/getguestbooklist?page=${page}&page_size=${pageSize}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		throw new Error("Network response was not ok");
	}

	const data = await response.json();
	if (!data.entries || typeof data.total_entries !== "number") {
		throw new Error("Invalid data structure");
	}
	return data;
};

const deleteGuestbookEntry = async (entryId: string): Promise<void> => {
	const token = sessionStorage.getItem("admin-token");

	if (!token) {
		throw new Error("You are not authorized to perform this action.");
	}

	const response = await fetch(
		`/api/admin/deleteguestbooks?entry_id=${entryId}`,
		{
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		}
	);

	if (!response.ok) {
		throw new Error("Failed to delete guestbook entry");
	}
};

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return format(date, "yyyy.MM.dd HH:mm");
};

const GuestBookLists: React.FC = () => {
	useAdminAuth();
	const router = useRouter();
	const [guestbooklists, setGuestBookLists] = useState<GuestBookEntry[]>([]);
	const [page, setPage] = useState(1);
	const [totalEntries, setTotalEntries] = useState(0);
	const [pageSize] = useState(10);
	const [error, setError] = useState<string | null>(null);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { entries, total_entries } = await fetchGuestbookLists(
					page,
					pageSize
				);
				setGuestBookLists(entries || []);
				setTotalEntries(total_entries || 0);
				console.log(entries);
			} catch (error: any) {
				setError(error.message);
				console.error("Failed to fetch guestbook entries:", error);
			}
		};
		fetchData();
	}, [page, pageSize]);

	const handleDelete = async (entryId: string) => {
		try {
			await deleteGuestbookEntry(entryId);
			setGuestBookLists((prev) =>
				prev.filter((entry) => entry._id !== entryId)
			);
			setTotalEntries((prev) => prev - 1);
		} catch (error: any) {
			setError(error.message);
			console.error("Failed to delete guestbook entry:", error);
		}
	};

	const confirmDelete = (entryId: string) => {
		setSelectedEntryId(entryId);
		setShowConfirmDialog(true);
	};

	const handleConfirm = () => {
		if (selectedEntryId) {
			handleDelete(selectedEntryId);
			setShowConfirmDialog(false);
			setSelectedEntryId(null);
		}
	};

	const handleCancel = () => {
		setShowConfirmDialog(false);
		setSelectedEntryId(null);
	};

	const handleNextPage = () => {
		if (page * pageSize < totalEntries) {
			setPage(page + 1);
		}
	};

	const handlePreviousPage = () => {
		if (page > 1) {
			setPage(page - 1);
		}
	};

	return (
		<div className="relative h-screen bg-blue-200 p-4">
			{error && <div className="text-red-500 mb-4">{error}</div>}
			<div className="overflow-y-auto h-[calc(100%-4rem)] mb-4">
				<ul>
					{guestbooklists.map((guestbook) => (
						<li
							key={guestbook._id}
							className="border p-2 mb-2 flex justify-between items-center"
						>
							<div>
								<div>
									{formatDate(guestbook.date)} {guestbook.name}
								</div>
								<div>{guestbook.message}</div>
								<div>
									{guestbook.photo_data ? (
										<img
											src={`data:image/jpeg;base64,${guestbook.photo_data}`}
											alt="Guestbook entry"
											className="w-12" // or style={{ width: "300px" }}
										/>
									) : (
										"사진없음"
									)}
								</div>
							</div>
							<button
								onClick={() => confirmDelete(guestbook._id)}
								className="px-4 py-2 bg-red-500 text-white rounded"
							>
								Delete
							</button>
						</li>
					))}
				</ul>
			</div>
			<div className="absolute bottom-0 left-0 right-0 bg-blue-200 p-4 flex justify-between items-center">
				<button
					onClick={handlePreviousPage}
					disabled={page === 1}
					className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
				>
					Previous
				</button>
				<span>{`Page ${page} of ${Math.ceil(totalEntries / pageSize)}`}</span>
				<button
					onClick={() => router.push("/admin")}
					className="px-4 py-2 bg-green-500 text-white rounded"
				>
					Admin Page
				</button>
				<button
					onClick={handleNextPage}
					disabled={page * pageSize >= totalEntries}
					className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
				>
					Next
				</button>
			</div>
			{showConfirmDialog && (
				<ConfirmDialog
					message="Are you sure you want to delete this entry?"
					onConfirm={handleConfirm}
					onCancel={handleCancel}
				/>
			)}
		</div>
	);
};

export default GuestBookLists;
