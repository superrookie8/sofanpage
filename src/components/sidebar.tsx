"use client";
import useGoBack from "@/hooks/useGoBack";
import { useRouter } from "next/navigation";

interface Props {}

const Sidebar: React.FC<Props> = (props) => {
	const router = useRouter();
	const goBack = useGoBack();
	return (
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
				onClick={goBack}
				className="bg-gray-500 text-white font-bold py-2 px-4 rounded w-[100px] mr-2 absolute top-[50px] left-0 m-3"
			>
				back
			</button>
		</div>
	);
};

export default Sidebar;
