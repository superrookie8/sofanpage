"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileModal from "@/components/profileModal";
import { GuestBookEntry } from "@/data/guestbook";
import { format } from "date-fns";
import Image from "next/image";
import { fetchUserStats } from "@/api";
import Modal from "./alertModal";// Modal 컴포넌트 import

export const fetchUserInfo = async (): Promise<{
	nickname: string;
	description?: string;
	photoUrl?: string;
}> => {
	const response = await fetch("/api/getuserinfo", {
		headers: {
			Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		},
	});
	if (!response.ok) {
		throw new Error("Failed to fetch user info");
	}
	const data = await response.json();
	return data;
};

export const fetchGuestbookEntries = async (filter: {
	user: string;
	page: number;
	pageSize: number;
}): Promise<{ entries: GuestBookEntry[]; total_entries: number }> => {
	const response = await fetch(
		`/api/getuserguestbook?user=${filter.user}&page=${filter.page}&page_size=${filter.pageSize}`,
		{
			headers: {
				Authorization: `Bearer ${sessionStorage.getItem("token")}`,
			},
		}
	);
	if (!response.ok) {
		throw new Error("Failed to fetch guestbook entries");
	}
	const data = await response.json();
	return data;
};

export const deleteGuestbookEntry = async (entryId: string): Promise<void> => {
	const response = await fetch(`/api/deleteguestbook?entry_id=${entryId}`, {
		method: "DELETE",
		headers: {
			Authorization: `Bearer ${sessionStorage.getItem("token")}`,
		},
	});
	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.message);
	}
};

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return format(date, "yyyy.MM.dd HH:mm");
};

const MyPageComp: React.FC = () => {
	const router = useRouter();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
	const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
	const [profile, setProfile] = useState({
		nickname: "",
		description: "",
		photoUrl: "",
	});

	const [userStats, setUserStats] = useState({
		win_percentage: 0,
		sunny_percentage: 0,
		home_win_percentage: 0,
		away_win_percentage: 0,
		attendance_percentage: 0,
	});
	const [photoGuestbookEntries, setPhotoGuestbookEntries] = useState<
		GuestBookEntry[]
	>([]);
	const [noPhotoGuestbookEntries, setNoPhotoGuestbookEntries] = useState<
		GuestBookEntry[]
	>([]);
	const [scrapNews, setScrapNews] = useState<any[]>([]);
	const [photoPage, setPhotoPage] = useState(1);
	const [noPhotoPage, setNoPhotoPage] = useState(1);
	const pageSize = 10;

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (!token) {
			router.push("/login");
		} else {
			fetchUserInfo()
				.then((data) => {
					setProfile({
						nickname: data.nickname,
						description: data.description || "",
						photoUrl: data.photoUrl || "",
					});
					return fetchUserStats(data.nickname);
				})
				.then((stats) => {
					setUserStats(stats);
				})
				.catch((error) => {
					console.error("Error fetching user info:", error);
				});
		}
	}, [router]);

	useEffect(() => {
		if (profile.nickname) {
			fetchGuestbookEntries({
				user: profile.nickname,
				page: photoPage,
				pageSize,
			})
				.then((data) => {
					const photoEntries = data.entries.filter((entry) => entry.photo_data);
					setPhotoGuestbookEntries(photoEntries);
				})
				.catch((error) => {
					console.error("Error fetching guestbook entries:", error);
				});
		}
	}, [profile.nickname, photoPage]);

	useEffect(() => {
		if (profile.nickname) {
			fetchGuestbookEntries({
				user: profile.nickname,
				page: noPhotoPage,
				pageSize,
			})
				.then((data) => {
					const noPhotoEntries = data.entries.filter(
						(entry) => !entry.photo_data
					);
					setNoPhotoGuestbookEntries(noPhotoEntries);
				})
				.catch((error) => {
					console.error("Error fetching guestbook entries:", error);
				});
		}
	}, [profile.nickname, noPhotoPage]);

	const handleSaveProfile = async (newProfile: {
		description?: string;
		photo?: File | null;
	}) => {
		const formData = new FormData();
		if (newProfile.description) {
			formData.append("description", newProfile.description);
		}
		if (newProfile.photo) {
			formData.append("photo", newProfile.photo);
		}

		try {
			const response = await fetch("/api/putuserinfo", {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${sessionStorage.getItem("token")}`,
				},
				body: formData,
			});

			if (!response.ok) {
				const contentType = response.headers.get("content-type");
				if (contentType && contentType.indexOf("application/json") !== -1) {
					const errorData = await response.json();
					console.error("Failed to update profile:", errorData.message);
					throw new Error(errorData.message);
				} else {
					const errorText = await response.text();
					console.error("Failed to update profile:", errorText);
					throw new Error(errorText);
				}
			}

			const data = await response.json();
			setProfile((prevProfile) => ({
				...prevProfile,
				description: data.description || prevProfile.description,
				photoUrl: data.photoUrl || prevProfile.photoUrl,
			}));
		} catch (error) {
			let errorMessage = "An unknown error occurred";
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			console.error("Error updating profile:", errorMessage);
			alert(`Error updating profile: ${errorMessage}`);
		}
	};

	const handleDeleteEntry = async (entryId: string) => {
		setEntryToDelete(entryId);
		setAlertMessage("정말로 이 항목을 삭제하시겠습니까?");
		setIsDeleteConfirm(true);
		setIsAlertModalOpen(true);
	};

	const confirmDelete = async () => {
		if (entryToDelete) {
			try {
				await deleteGuestbookEntry(entryToDelete);
				setPhotoGuestbookEntries(
					photoGuestbookEntries.filter((entry) => entry._id !== entryToDelete)
				);
				setNoPhotoGuestbookEntries(
					noPhotoGuestbookEntries.filter((entry) => entry._id !== entryToDelete)
				);
				setAlertMessage("항목이 성공적으로 삭제되었습니다.");
				setIsDeleteConfirm(false);
			} catch (error) {
				console.error("Failed to delete guestbook entry:", error);
				setAlertMessage(`Failed to delete guestbook entry: ${(error as Error).message}`);
				setIsDeleteConfirm(false);
			}
		}
		setIsAlertModalOpen(true);
	};

	const closeAlertModal = () => {
		setIsAlertModalOpen(false);
		setEntryToDelete(null);
	};

	return (
		<div className="w-full p-4">
			<div className=" w-full h-[280px] flex flex-col items-center pt-8 mb-4 border-b-2 border-t-2 border-red-500 ">
				<div className="flex space-x-4 flex-col">
					<div className="flex flex-row justify-center gap-4">
						<div className="flex items-center">
							{profile.photoUrl ? (
								<div className="relative w-24 h-24 rounded-full">
									<Image
										src={profile.photoUrl}
										alt="Profile"
										fill
										className="rounded-full"
										style={{ objectFit: "cover" }}
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 24px"
									/>
								</div>
							) : (
								<div className="relative w-24 h-24 rounded-full">
									<Image
										src="/images/ci_2023_default.png"
										alt="Default Profile"
										fill
										className="rounded-full"
										style={{ objectFit: "cover" }}
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 24px"
									/>
								</div>
							)}
						</div>
						<div className="flex flex-col mt-2">
							<div className="text-gray-500 text-sm mt-4">
								@{profile.nickname}
							</div>
							<div>{profile.description}</div>
						</div>
					</div>
					<div>
						<div className="flex flex-col items-center space-y-2 mb-4">
							<div className="flex flex-col text-sm pt-4">
								<div className="flex flex-row w-full gap-4 ">
									<div className="text-gray-500">
										농구마니아지수: {userStats.attendance_percentage}%
									</div>
									<div className="text-gray-500">
										날씨요정지수: {userStats.sunny_percentage}%
									</div>
								</div>
								<div className="flex flex-row  w-full gap-8">
									<div className="text-gray-500">
										직관승요지수: {userStats.win_percentage}%
									</div>
									<div className="text-gray-500">
										홈경기지수: {userStats.home_win_percentage}%
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<button
					onClick={() => setIsModalOpen(true)}
					className="mt-auto mb-8 px-4 py-2 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white"
				>
					Edit Profile
				</button>
			</div>

			<div className="mb-4 flex flex-col pl-2 pr-2">
				<div className="flex flex-col space-y-8">
					<h2 className="text-xl mb-2">My GuestBooks</h2>
					<div className="h-1/2 pl-2 pr-2">
						<h3 className="text-lg mb-2">With Photos</h3>
						<div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-h-96 overflow-y-scroll justify-center">
							{photoGuestbookEntries.map((entry) => (
								<div
									key={entry._id}
									className="flex flex-col space-y-2 p-4 border rounded shadow-md w-[220px] h-[350px] mx-auto"
								>
									{entry.photo_data && (
										<div className="h-1/2 overflow-hidden">
											<div className="relative w-full h-full">
												<Image
													src={`data:image/jpeg;base64,${entry.photo_data}`}
													alt="Guestbook entry"
													fill
													style={{ objectFit: "cover", objectPosition: "top" }}
													className="object-cover object-top"
												/>
											</div>
										</div>
									)}
									<div className="text-center text-sm text-gray-500 font-bold mt-2">
										{entry.name}
									</div>
									<div className="flex-1 text-sm overflow-y-auto">
										{entry.message}
									</div>
									<div className="text-sm text-gray-400 text-center mt-2">
										{formatDate(entry.date)}
									</div>
									<button
										onClick={() => handleDeleteEntry(entry._id)}
										className="px-2 py-1 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white mt-2"
									>
										Delete
									</button>
								</div>
							))}
						</div>
						<div className="flex justify-between">
							<div className="mt-4 text-gray-400 hover:bg-red-500 hover:text-white rounded p-1 mb-2">
								<button
									disabled={photoPage === 1}
									onClick={() => setPhotoPage(photoPage - 1)}
								>
									Previous
								</button>
							</div>
							<div className="mt-4 text-gray-400 hover:bg-red-500 hover:text-white rounded p-1 mb-2">
								<button onClick={() => setPhotoPage(photoPage + 1)}>
									Next
								</button>
							</div>
						</div>
					</div>
					<div className="h-1/2 pl-2 pr-2">
						<h3 className="text-lg mb-2">Without Photos</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-h-96 overflow-y-scroll justify-center">
							{noPhotoGuestbookEntries.map((entry) => (
								<div
									key={entry._id}
									className="flex flex-col space-y-2 p-4 border rounded shadow-md w-[220px] h-[350px] mx-auto"
								>
									<div className="text-center text-sm text-gray-500 font-bold">
										{entry.name}
									</div>
									<div className="flex-1 text-sm overflow-y-auto">
										{entry.message}
									</div>
									<div className="text-sm text-gray-400 text-center">
										{formatDate(entry.date)}
									</div>
									<button
										onClick={() => handleDeleteEntry(entry._id)}
										className="px-2 py-1 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white mt-2"
									>
										Delete
									</button>
								</div>
							))}
						</div>
						<div className="flex justify-between">
							<div className="mt-4 text-gray-400 hover:bg-red-500 hover:text-white rounded p-1 mb-2">
								<button
									disabled={noPhotoPage === 1}
									onClick={() => setNoPhotoPage(noPhotoPage - 1)}
								>
									Previous
								</button>
							</div>
							<div className="mt-4 text-gray-400 hover:bg-red-500 hover:text-white rounded p-1 mb-2">
								<button onClick={() => setNoPhotoPage(noPhotoPage + 1)}>
									Next
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="mb-4 flex pl-2">
				<h2 className="text-xl mb-2">Scrap News</h2>
				<ul>
					{scrapNews.map((news) => (
						<li key={news.id} className="border p-2 mb-2">
							<div>{news.title}</div>
							<div className="text-sm text-gray-600">{news.date}</div>
						</li>
					))}
				</ul>
			</div>
			<ProfileModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveProfile}
				profile={profile}
			/>
			<Modal
				isOpen={isAlertModalOpen}
				message={alertMessage}
				onClose={closeAlertModal}
				buttonText={isDeleteConfirm ? "확인" : "닫기"}
				onConfirm={isDeleteConfirm ? confirmDelete : closeAlertModal}
			/>
		</div>
	);
};

export default MyPageComp;
