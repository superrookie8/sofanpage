import { useRouter, useParams } from "next/navigation";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { pageState } from "@/states/pageState";

interface Props {
	currentCategory: string;
}

export const GuestBookButtons: React.FC<Props> = () => {
	const setPage = useSetRecoilState(pageState);
	const currentPage = useRecoilValue(pageState);
	console.log(currentPage);
	return (
		<div className="bg-blue-300 w-[300px] h-[450px] flex flex-col justify-center items-center">
			<div className="bg-violet-500 w-[300px] h-[300px] flex flex-col justify-center items-center">
				{currentPage === "defalut" ? (
					<button
						className="w-[200px] bg-green-500 text-white font-bold py-2 px-4 rounded  mb-[20px]"
						onClick={() => {
							setPage("photoAndText");
						}}
					>
						사진과글
					</button>
				) : (
					<button
						className="w-[200px] bg-green-500 text-white font-bold py-2 px-4 rounded  mb-[20px]"
						onClick={() => {
							setPage("defalut");
						}}
					>
						그냥 글
					</button>
				)}
				{currentPage === "qna" ? (
					<button
						className="w-[200px] bg-green-500 text-white font-bold py-2 px-4 rounded  "
						onClick={() => {
							setPage("photoAndText");
						}}
					>
						사진과글
					</button>
				) : (
					<button
						className="w-[200px] bg-green-500 text-white font-bold py-2 px-4 rounded"
						onClick={() => {
							setPage("qna");
						}}
					>
						오늘의 질문
					</button>
				)}
			</div>
			<div className="bg-pink-300 w-[300px] h-[150px] flex justify-center items-center">
				<button className="w-[200px] bg-red-500 text-white font-bold py-2 px-4 rounded  ">
					남기기
				</button>
			</div>
		</div>
	);
};

export const GoCreateButtons: React.FC<Props> = () => {
	const router = useRouter();
	const params = useParams<{ category: string }>();
	const goToPage = (pageName: string) => {
		router.push(`/${params.category}/${pageName}`);
	};
	return (
		<div className="bg-green-500 min-h-[100px] min-w-[1200px] flex absolute flex justify-center items-center bottom-0">
			<button
				onClick={() => {
					goToPage("guestbooks/create");
				}}
				className="bg-blue-500 text-white fond-bold py-2 px-4 rounded  w-[100px] mr-2 absolute m-4"
			>
				create
			</button>
		</div>
	);
};
