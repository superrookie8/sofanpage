"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { GuestBookButtons } from "@/components/buttons";
import DateTimeDisplay from "@/components/Date";
import { useRecoilValue } from "recoil";
import { pageState } from "@/states/pageState";
import PhotoUpload from "@/components/photoUpload";
import Header from "@/components/header";
import useAuth from "@/hooks/useAuth";

interface PostData {
	name: string;
	message: string;
	photo?: string;
	date: string;
}

const GuestBookCreate: React.FC = () => {
	const user = useAuth();
	const params = useParams<{ category: string }>();
	const router = useRouter();
	const [write, setWrite] = useState("");
	const [photo, setPhoto] = useState<string | null>(null);
	const currentPage = useRecoilValue(pageState);

	const handlerOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setWrite(e.target.value);
	};

	const handlePhotoChange = (photoUrl: string) => {
		setPhoto(photoUrl);
	};

	const postData = async (): Promise<void> => {
		if (!user) {
			alert("로그인 해주세요.");
			return;
		}

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
			alert("Guestbook entry added successfully");
			// 사진 업로드 후 미리보기 상태 초기화
			setPhoto(null);
			setWrite("");
			router.push(`/guestbooks/read`);
		} catch (error) {
			console.error("There was a problem with the fetch operation:", error);
		}
	};

	return (
		<div>
			<div className="flex justify-center items-center ">
				<div className="bg-red-500 min-h-screen w-full flex justify-center p-8 relative ">
					{currentPage === "photoAndText" ? (
						<div className="w-[1200px] min-h-[580px] flex flex-row justify-center ">
							<div className=" w-full flex flex-row justify-center ">
								<div className="bg-red-400  w-[800px] h-[450px] flex flex-col justify-between items-center">
									<div className="mt-4">사진 방명록 남겨요!</div>
									<div className="bg-pink-400 w-[800px] h-[400px] flex flex-row justify-center items-center ">
										<div className="bg-gray-500 w-[400px] h-[400px] flex justify-center items-center">
											<PhotoUpload onPhotoUpload={handlePhotoChange} />
										</div>
										<div className="bg-red-700 w-[400px] h-[400px] flex justify-center items-center">
											<textarea
												className="w-[350px] h-[300px] overflow-auto"
												onChange={handlerOnChange}
												value={write}
											></textarea>
										</div>
									</div>
								</div>
								<div className=" flex flex-row justify-center  ">
									<GuestBookButtons
										currentCategory="/guestbooks/create"
										onSubmit={postData}
									/>
								</div>
							</div>
						</div>
					) : (
						<div className="bg-yellow-500 min-h-[580px] min-w-[1200px] flex justify-center">
							<div className="bg-red-400  w-[800px] h-[450px] flex flex-col justify-center items-center ">
								<div className="mt-4">방명록 남겨요!</div>
								<textarea
									className="w-[450px] h-[300px] mt-[32px] p-2 overflow-auto"
									onChange={handlerOnChange}
									value={write}
								></textarea>
							</div>
							<div className=" flex flex-row justify-center  ">
								<GuestBookButtons
									currentCategory="/guestbooks/create"
									onSubmit={postData}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default GuestBookCreate;
