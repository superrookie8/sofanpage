"use client";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { GuestBookButtons } from "@/components/buttons";
import DateTimeDisplay from "@/components/date";
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
	const [photo, setPhoto] = useState("");
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

		const data: PostData = {
			name: user.nickname,
			message: write,
			photo: currentPage === "photoAndText" ? photo : undefined,
			date: new Date().toISOString(),
		};

		try {
			const response = await fetch("/api/postguestbook", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const responseData = await response.json();
			console.log(responseData);
			alert("Guestbook entry added successfully");
			router.push(`/guestbooks/read`);
		} catch (error) {
			console.error("There was a problem with the fetch operation:", error);
		}
	};

	return (
		<div>
			<Header pathname="" />
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
