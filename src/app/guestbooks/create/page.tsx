"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { pageState } from "@/states/pageState";
import { photoPreviewState } from "@/states/photoPreviewState";
import PhotoUpload from "@/components/shared/photoUpload";
import useAuth from "@/hooks/useAuth";
import AlertModal from "@/components/shared/alertModal";

const GuestBookCreate: React.FC = () => {
	const user = useAuth();
	const router = useRouter();
	const [write, setWrite] = useState("");
	const [photo, setPhoto] = useState<string | null>(null);
	const currentPage = useRecoilValue(pageState);
	const setPage = useSetRecoilState(pageState);
	const [photos, setPhotos] = useRecoilState(photoPreviewState);
	const [isLoading, setIsLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalMessage, setModalMessage] = useState("");

	useEffect(() => {
		setWrite("");
		setPhoto(null);
		setPhotos([]);
		setPage("default");
		return () => {
			// 컴포넌트 언마운트 시에도 초기화
			setWrite("");
			setPhoto(null);
			setPhotos([]);
			setPage("default");
		};
	}, [setPage, setPhotos]);

	const handlerOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setWrite(e.target.value);
	};

	const handlePhotoChange = (photoUrl: string) => {
		setPhoto(photoUrl);
	};

	const postData = async (): Promise<void> => {
		if (!user) {
			setModalMessage("로그인 해주세요.");
			setModalOpen(true);
			return;
		}

		setIsLoading(true);

		const formData = new FormData();
		formData.append("name", user.nickname);
		formData.append("message", write);
		formData.append("date", new Date().toISOString());
		if (currentPage === "photoAndText" && photo) {
			const response = await fetch(photo);
			const blob = await response.blob();
			const file = new File([blob], "photo.jpg", { type: blob.type });
			formData.append("photo", file);
		}

		try {
			const response = await fetch("/api/postguestbook", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Network response was not ok");
			}

			const responseData = await response.json();
			console.log(responseData);
			setModalMessage("방명록이 성공적으로 추가되었습니다.");
			setModalOpen(true);
			// 사진 업로드 후 미리보기 상태 초기화
			setPhoto(null);
			setWrite("");
			setPhotos([]);
			setPage("default");
			// router.push(`/guestbooks/read`);
		} catch (error) {
			console.error("There was a problem with the fetch operation:", error);
			setModalMessage("방명록 추가 중 오류가 발생했습니다.");
			setModalOpen(true);
		} finally {
			setIsLoading(false);
		}
	};

	const closeModal = () => {
		setModalOpen(false);
		router.push(`/guestbooks/read`);
	};

	return (
		<div>
			<div className="flex justify-center items-center">
				<div className="bg-black bg-opacity-75 min-h-screen w-full flex justify-center p-8 relative">
					{currentPage === "photoAndText" ? (
						<div className="w-full max-w-6xl flex flex-col lg:flex-row justify-center space-y-4 lg:space-y-0">
							<div className="w-full flex flex-col lg:flex-row justify-center items-center space-y-4 lg:space-y-0">
								<div className="border-red-400 w-full lg:w-[800px] h-auto lg:h-[410px] flex flex-col justify-between items-center space-y-4 lg:space-y-0">
									<div className="text-white">사진 방명록 남겨요!</div>
									<div className="w-full lg:w-[800px] h-auto lg:h-[300px] space-y-4 lg:space-y-0 flex flex-col lg:flex-row justify-center items-center">
										<div className="w-full lg:w-[400px] h-auto lg:h-[400px] flex justify-center items-center">
											<PhotoUpload onPhotoUpload={handlePhotoChange} />
										</div>
										<div className="w-full lg:w-[400px] h-auto lg:h-[420px] flex justify-center items-center lg:mt-0">
											<textarea
												className="w-[350px] h-[300px] overflow-auto rounded focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 mt-4 lg:mt-0"
												onChange={handlerOnChange}
												value={write}
											></textarea>
										</div>
									</div>
									<div className="flex flex-row w-full justify-center items-center space-x-4 lg:mt-4">
										<button
											className="w-[200px] bg-gray-500 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded"
											onClick={() => setPage("default")}
										>
											그냥 글
										</button>
										<button
											className={`w-[200px] text-white font-bold py-2 px-4 rounded ml-0 lg:ml-4 flex justify-center items-center ${
												isLoading || (!write && !photo)
													? "bg-gray-500"
													: "bg-gray-500 hover:bg-red-500"
											}`}
											onClick={postData}
											disabled={isLoading || (!write && !photo)}
										>
											{isLoading ? (
												<svg
													className="animate-spin h-5 w-5 text-white"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													></circle>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													></path>
												</svg>
											) : (
												"남기기"
											)}
										</button>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0">
							<div className="w-full lg:w-[800px] h-auto lg:h-[420px] flex flex-col justify-center items-center space-y-4 lg:space-y-0">
								<div className="text-white mb-4 lg:mb-0">방명록 남겨요!</div>
								<div className="w-full lg:w-[800px] h-auto lg:h-[350px] space-y-4 lg:space-y-0 flex flex-col lg:flex-row justify-center items-center">
									<textarea
										className="w-full lg:w-[450px] h-[300px] overflow-auto rounded focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 mt-4 lg:mt-0"
										onChange={handlerOnChange}
										value={write}
									></textarea>
								</div>
								<div className="flex flex-row w-full justify-center items-center space-x-4 lg:mt-4">
									<button
										className="w-[200px] bg-gray-500 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded"
										onClick={() => setPage("photoAndText")}
									>
										사진과 글
									</button>
									<button
										className={`w-[200px] text-white font-bold py-2 px-4 rounded flex justify-center items-center ${
											isLoading || !write
												? "bg-gray-500"
												: "bg-gray-500 hover:bg-red-500"
										}`}
										onClick={postData}
										disabled={isLoading || !write}
									>
										{isLoading ? (
											<svg
												className="animate-spin h-5 w-5 text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
										) : (
											"남기기"
										)}
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
			<AlertModal
				isOpen={modalOpen}
				onClose={closeModal}
				message={modalMessage}
			/>
		</div>
	);
};

export default GuestBookCreate;
