"use client";

import useAuth from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { GuestBookEntry } from "@/data/guestbook";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRecoilValue } from "recoil";
import { loginState } from "@/states/loginState";
import { useLoading } from "@/context/LoadingContext";
import LoadingSpinner from "@/components/shared/loadingSpinner";

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
	// useAuth();
	const [activeTab, setActiveTab] = useState("photos");
	const [photoEntries, setPhotoEntries] = useState<GuestBookEntry[]>([]);
	const [noPhotoEntries, setNoPhotoEntries] = useState<GuestBookEntry[]>([]);
	const [loading, setLoading] = useState(false);
	const [photoPage, setPhotoPage] = useState(1);
	const [noPhotoPage, setNoPhotoPage] = useState(1);
	const pageSize = 10;
	const router = useRouter();
	const isLoggedIn = useRecoilValue(loginState);
	const { setIsLoading } = useLoading();

	useEffect(() => {
		setIsLoading(true);
		setLoading(true);
		fetchGuestbookEntries()
			.then((data) => {
				setPhotoEntries(data.photo_entries);
				setNoPhotoEntries(data.no_photo_entries);
				setLoading(false);
				setIsLoading(false);
			})
			.catch((error) => {
				console.error("Failed to fetch guestbook entries:", error);
				setLoading(false);
				setIsLoading(false);
			});
	}, []);

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
	};

	const handleCreateClick = () => {
		if (isLoggedIn) {
			router.push("/guestbooks/create");
		} else {
			router.push("/login");
		}
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
		<div className=" w-full flex justify-center items-center p-4 rounded-lg shadow-lg">
			<div className="relative p-4 w-full flex flex-col">
				{/* Tabs */}
				<div className="flex justify-between space-x-4 mb-4 w-full">
					<div className="w-full flex space-x-2 flex wrap">
						<button
							onClick={() => handleTabChange("photos")}
							className={`px-2 py-2 rounded w-full sm:text-sm xsm:text-sm ${
								activeTab === "photos"
									? "bg-red-500 text-white"
									: "bg-gray-200 text-gray-700"
							}`}
						>
							사진방명록
						</button>
						<button
							onClick={() => handleTabChange("noPhotos")}
							className={`px-2 py-2 rounded w-full sm:text-sm xsm:text-sm ${
								activeTab === "noPhotos"
									? "bg-red-500 text-white"
									: "bg-gray-200 text-gray-700"
							}`}
						>
							글방명록
						</button>
					</div>
					<div className="flex ">
						<button
							onClick={handleCreateClick}
							className="border-red-500 border-2 text-red-500 font-bold py-2 px-4 rounded top-4 right-4 hover:bg-red-500 hover:text-white w-full sm:text-sm xsm:text-sm "
						>
							방명록남기기
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
										<div className="w-full h-full relative">
											{/* <img
												src="/api/guestbook/photo/6697f9ea6b62b510259604bc"
												alt="Guestbook Photo"
											/> */}
											<Image
												src={`data:image/jpeg;base64,${entry.photo_data}`}
												// src={entry.photo_data}
												alt="Guestbook entry"
												fill
												sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
												style={{ objectFit: "cover" }}
												className="object-cover"
												priority
											/>
										</div>
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
						{loading && <LoadingSpinner />}
					</div>
				</div>

				<div className="flex justify-between mt-4">
					<button
						disabled={currentPage === 1}
						onClick={() => setPage(currentPage - 1)}
						className={`px-4 py-2 rounded ${
							currentPage === 1
								? "bg-gray-100 text-gray-400 cursor-not-allowed" // disabled 상태
								: "bg-red-400 text-gray-700 hover:bg-gray-500" // 활성화 상태
						}`}
					>
						이전
					</button>
					<button
						disabled={currentPage * pageSize >= totalEntries}
						onClick={() => setPage(currentPage + 1)}
						className={`px-4 py-2 rounded ${
							currentPage * pageSize >= totalEntries
								? "bg-gray-100 text-gray-400 cursor-not-allowed" // disabled 상태
								: "bg-red-400 text-gray-700 hover:bg-gray-500" // 활성화 상태
						}`}
					>
						다음
					</button>
				</div>
			</div>
		</div>
	);
};

export default GuestBookList;
