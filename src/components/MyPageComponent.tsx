"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileModal from "@/components/ProfileModal";
import { GuestBookEntry } from "@/data/guestbook";
import { format } from "date-fns";

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
	const [profile, setProfile] = useState({
		nickname: "",
		description: "",
		photoUrl: "",
	});
	const [photoGuestbookEntries, setPhotoGuestbookEntries] = useState<
		GuestBookEntry[]
	>([]);
	const [noPhotoGuestbookEntries, setNoPhotoGuestbookEntries] = useState<
		GuestBookEntry[]
	>([]);
	const [scrapNews, setScrapNews] = useState<any[]>([]); // 뉴스 스크랩 기능 추가 후 타입 지정
	const [photoPage, setPhotoPage] = useState(1);
	const [noPhotoPage, setNoPhotoPage] = useState(1);
	const pageSize = 10;

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (!token) {
			router.push("/login");
		} else {
			// 프로필 정보와 guestbookEntries를 가져오는 로직 추가
			fetchUserInfo().then((data) => {
				setProfile({
					nickname: data.nickname,
					description: data.description || "",
					photoUrl: data.photoUrl || "",
				});
			});
		}
	}, [router]);

	useEffect(() => {
		if (profile.nickname) {
			fetchGuestbookEntries({
				user: profile.nickname,
				page: photoPage,
				pageSize,
			}).then((data) => {
				const photoEntries = data.entries.filter((entry) => entry.photo_data);
				setPhotoGuestbookEntries(photoEntries);
			});
		}
	}, [profile.nickname, photoPage]);

	useEffect(() => {
		if (profile.nickname) {
			fetchGuestbookEntries({
				user: profile.nickname,
				page: noPhotoPage,
				pageSize,
			}).then((data) => {
				const noPhotoEntries = data.entries.filter(
					(entry) => !entry.photo_data
				);
				setNoPhotoGuestbookEntries(noPhotoEntries);
			});
		}
	}, [profile.nickname, noPhotoPage]);

	const handleSaveProfile = async (newProfile: {
		nickname?: string;
		description?: string;
		photo?: File | null;
	}) => {
		// 프로필 저장 API 요청 추가
		const formData = new FormData();
		if (newProfile.nickname) {
			formData.append("nickname", newProfile.nickname);
		}
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
			setProfile({
				nickname: data.nickname || profile.nickname,
				description: data.description || profile.description,
				photoUrl: data.photoUrl || profile.photoUrl,
			});
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
		if (confirm("Are you sure you want to delete this entry?")) {
			try {
				await deleteGuestbookEntry(entryId);
				setPhotoGuestbookEntries(
					photoGuestbookEntries.filter((entry) => entry._id !== entryId)
				);
				setNoPhotoGuestbookEntries(
					noPhotoGuestbookEntries.filter((entry) => entry._id !== entryId)
				);
			} catch (error) {
				console.error("Failed to delete guestbook entry:", error);
				alert(`Failed to delete guestbook entry: ${(error as Error).message}`);
			}
		}
	};

	return (
		<div className=" w-full p-4">
			<div className="bg-white w-full h-[250px] flex flex-col items-center pt-8 mb-4">
				<div className="flex space-x-4">
					<div>
						{profile.photoUrl ? (
							<img
								src={profile.photoUrl}
								alt="Profile"
								className="w-24 h-24 rounded-full mb-2"
							/>
						) : (
							<img
								src="/images/ci_2023_default.png"
								alt="Default Profile"
								className="W-24 h-24 rounded-full mb-2"
							/>
						)}
					</div>
					<div className=" flex flex-col mt-2">
						<div> {profile.nickname}</div>
						<div> {profile.description}</div>
					</div>
				</div>
				<button
					onClick={() => setIsModalOpen(true)}
					className="mt-auto mb-4 px-4 py-2 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white"
				>
					Edit Profile
				</button>
			</div>
			<div className="mb-4 bg-white flex flex-col pl-2 pr-2">
				<div className="flex flex-col space-y-8">
					<h2 className="text-xl mb-2">My GuestBooks</h2>
					<div className="h-1/2 pl-2 pr-2 ">
						<h3 className="text-lg mb-2">With Photos</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-h-96 overflow-y-scroll">
							{photoGuestbookEntries.map((entry) => (
								<div
									key={entry._id}
									className="flex flex-col space-y-2 p-4 border rounded shadow-md w-[220px] h-[350px]"
								>
									{entry.photo_data && (
										<div className="h-1/2 overflow-hidden">
											<img
												src={`data:image/jpeg;base64,${entry.photo_data}`}
												alt="Guestbook entry"
												className="w-full h-full object-cover object-top"
											/>
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
										className="px-2 py-1 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white rounded mt-2"
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
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-h-96 overflow-y-scroll">
							{noPhotoGuestbookEntries.map((entry) => (
								<div
									key={entry._id}
									className="flex flex-col space-y-2 p-4 border rounded shadow-md w-[220px] h-[350px]"
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
										className="px-2 py-1 text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-white rounded mt-2"
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
		</div>
	);
};

export default MyPageComp;
