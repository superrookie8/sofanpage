"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileModal from "@/components/ProfileModal";
import { GuestBookEntry } from "@/data/guestbook";

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
		`/api/getguestbooks?user=${filter.user}&page=${filter.page}&page_size=${filter.pageSize}`,
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
	const [page, setPage] = useState(1);
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
			fetchGuestbookEntries({ user: profile.nickname, page, pageSize }).then(
				(data) => {
					const photoEntries = data.entries.filter((entry) => entry.photo_data);
					const noPhotoEntries = data.entries.filter(
						(entry) => !entry.photo_data
					);
					setPhotoGuestbookEntries(photoEntries);
					setNoPhotoGuestbookEntries(noPhotoEntries);
				}
			);
		}
	}, [profile.nickname, page]);

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
		<div className="p-4">
			<h1 className="text-2xl mb-4">My Page</h1>
			<div className="mb-4">
				<h2 className="text-xl mb-2">Profile</h2>
				{profile.photoUrl && (
					<img
						src={profile.photoUrl}
						alt="Profile"
						className="w-24 h-24 rounded-full mb-2"
					/>
				)}
				<div>Nickname: {profile.nickname}</div>
				<div>Description: {profile.description}</div>
				<button
					onClick={() => setIsModalOpen(true)}
					className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
				>
					Edit Profile
				</button>
			</div>
			<div className="mb-4">
				<h2 className="text-xl mb-2">My Guestbooks</h2>
				<div className="flex">
					<div className="w-1/2 pr-2">
						<h3 className="text-lg mb-2">With Photos</h3>
						<ul>
							{photoGuestbookEntries.map((entry) => (
								<li key={entry._id} className="border p-2 mb-2">
									<div>{entry.message}</div>
									<div className="text-sm text-gray-600">{entry.date}</div>
									{entry.photo_data && (
										<img
											src={`data:image/jpeg;base64,${entry.photo_data}`}
											alt="Guestbook entry"
											className="w-12 h-12"
										/>
									)}
									<button
										onClick={() => handleDeleteEntry(entry._id)}
										className="px-2 py-1 bg-red-500 text-white rounded mt-2"
									>
										Delete
									</button>
								</li>
							))}
						</ul>
					</div>
					<div className="w-1/2 pl-2">
						<h3 className="text-lg mb-2">Without Photos</h3>
						<ul>
							{noPhotoGuestbookEntries.map((entry) => (
								<li key={entry._id} className="border p-2 mb-2">
									<div>{entry.message}</div>
									<div className="text-sm text-gray-600">{entry.date}</div>
									<button
										onClick={() => handleDeleteEntry(entry._id)}
										className="px-2 py-1 bg-red-500 text-white rounded mt-2"
									>
										Delete
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
				<div className="flex justify-between mt-4">
					<button disabled={page === 1} onClick={() => setPage(page - 1)}>
						Previous
					</button>
					<button onClick={() => setPage(page + 1)}>Next</button>
				</div>
			</div>
			<div className="mb-4">
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
