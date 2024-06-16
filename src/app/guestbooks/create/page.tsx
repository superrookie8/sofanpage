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
	user: string;
	text: string;
	tags: string[];
}
const GuestBookCreate: React.FC = () => {
	useAuth();
	const params = useParams<{ category: string }>();
	const router = useRouter();
	const [write, setWrite] = useState("");
	const currentPage = useRecoilValue(pageState);
	const goBackPage = (pageName: string) => {
		router.push(`/${params.category}/${pageName}`);
	};
	const handlerOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setWrite(e.target.value);
	};

	const postData = async (): Promise<void> => {
		const data: PostData = {
			user: "하나",
			text: "방명록 테스트",
			tags: ["소히", "팬페이지", "방명록"],
		};

		try {
			const response = await fetch("http://localhost:5000/insert", {
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
		} catch (error) {
			console.error("There was a problem with the fetch operation:", error);
		}
	};

	postData();

	return (
		<div>
			<Header pathname="" />
			<div className="flex justify-center items-center ">
				<div className="bg-red-500 min-h-screen w-full flex justify-center p-8 relative ">
					<div className=" w-[200px] h-[580px] flex flex-col justify-center items-center relative ">
						<button
							onClick={() => {
								router.push("/");
							}}
							className="bg-green-500 text-white font-bold py-2 px-4 rounded w-[100px] mr-2 absolute top-0 left-0 m-3"
						>
							Home
						</button>
						<button
							onClick={() => {
								goBackPage("/guestbooks/read");
							}}
							className="bg-gray-500 text-white font-bold py-2 px-4 rounded w-[100px] mr-2 absolute top-[50px] left-0 m-3"
						>
							back
						</button>
					</div>
					{currentPage === "photoAndText" ? (
						<div className="w-[1200px] min-h-[580px] flex flex-row justify-center ">
							<div className=" w-full flex flex-row justify-center ">
								<div className="bg-red-400  w-[800px] h-[450px] flex flex-col justify-center items-center">
									사진 방명록 남겨요!
									<DateTimeDisplay date={new Date()} />
									<div className="bg-pink-400 w-[800px] h-[400px] flex flex-row justify-center items-center ">
										<div className="bg-gray-500 w-[400px] h-[400px] flex justify-center items-center">
											<PhotoUpload />
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
									<GuestBookButtons currentCategory="/guestbooks/create" />
								</div>
							</div>
						</div>
					) : (
						<div className="bg-yellow-500 min-h-[580px] min-w-[1200px] flex justify-center">
							<div className="bg-red-400  w-[800px] h-[450px] flex flex-col justify-center items-center ">
								방명록 남겨요!
								<DateTimeDisplay date={new Date()} />
								<textarea
									className="w-[450px] h-[300px] mt-[32px] p-2 overflow-auto"
									onChange={handlerOnChange}
								></textarea>
							</div>
							<div className=" flex flex-row justify-center  ">
								<GuestBookButtons currentCategory="/guestbooks/create" />
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default GuestBookCreate;
