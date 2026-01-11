import React, { useEffect, useState } from "react";
import { Article } from "@/types/articles";
import Image from "next/image";
import useFormatDate from "@/shared/hooks/useFormatDate";
import useTruncateText from "@/shared/hooks/useTruncateText";

interface JumpballProps {
	articles: Article[];
	page: number;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	totalArticles: number;
	articlesPerPage: number;
}

const JumpballSection: React.FC<JumpballProps> = ({
	articles,
	page,
	setPage,
	totalArticles,
	articlesPerPage,
}) => {
	const formatDate = useFormatDate();
	const truncateText = useTruncateText(70);

	const [maxPagesToShow, setMaxPagesToShow] = useState(10);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 501) {
				setMaxPagesToShow(5);
			} else {
				setMaxPagesToShow(10);
			}
		};

		handleResize(); // 초기 실행
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const totalPages = Math.ceil(totalArticles / articlesPerPage);

	const startPage = Math.max(
		1,
		Math.floor((page - 1) / maxPagesToShow) * maxPagesToShow + 1
	);
	const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

	const handlePrevious = () => {
		setPage(Math.max(1, page - maxPagesToShow));
	};

	const handleNext = () => {
		setPage(Math.min(totalPages, page + maxPagesToShow));
	};

	console.log("Articles received:", articles);

	return (
		<div className="flex flex-col justify-center p-4 h-[320vh] sm:h-[150vh] overflow-y-scroll">
			<h2 className="flex justify-center mb-4">점프볼</h2>
			<div className="grid grid-cols-1 gap-4 h-full overflow-y-scroll">
				{articles.map((article) => (
					<div
						key={article.id}
						className="bg-gray-100 shadow-md rounded-lg p-4 flex flex-col sm:h-auto"
					>
						<div className="flex justify-center md:w-1/3 mb-4 md:mb-0 sm:pr-4">
							{article.imageUrl ? (
								<div className="relative w-[300px] h-[200px]">
									<Image
										src={article.imageUrl}
										alt={article.title || "기사 이미지"}
										fill
										sizes="(max-width: 768px) 100vw, 300px"
										style={{
											objectFit: "contain",
											borderRadius: "0.5rem",
										}}
										priority={false}
										className="hover:scale-105 transition-transform duration-300"
									/>
								</div>
							) : (
								<div className="w-[300px] h-[200px] bg-gray-200 flex items-center justify-center rounded-lg">
									<span className="text-gray-400">이미지 없음</span>
								</div>
							)}
						</div>
						<div className="  sm:text-xs">
							<p>{formatDate(article.publishedAt)}</p>
							<h2>{article.title}</h2>
							<p>{truncateText(article.summary)}</p>
							<div className="pt-4">
								<a
									href={article.url}
									className="flex justify-center inline-block px-4 py-2 border border-red-300 text-red-300 rounded"
								>
									더보기
								</a>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="flex justify-between mt-4 text-xs ">
				<button
					disabled={page === 1}
					onClick={handlePrevious}
					className="px-1 border border-red-500 rounded disabled:opacity-50"
				>
					⟨
				</button>
				<div className="flex space-x-1 text-xs p-2">
					{Array.from({ length: endPage - startPage + 1 }).map((_, index) => (
						<button
							key={startPage + index}
							onClick={() => setPage(startPage + index)}
							className={`w-8 px-2 py-1 ${
								page === startPage + index
									? "bg-red-500 text-white rounded"
									: "border border-red-500 rounded"
							}`}
						>
							{startPage + index}
						</button>
					))}
					{endPage < totalPages && <span>...</span>}
				</div>
				<button
					disabled={page * articlesPerPage >= totalArticles}
					onClick={handleNext}
					className="px-1 disabled:opacity-50 border border-red-500 rounded"
				>
					⟩
				</button>
			</div>
		</div>
	);
};

export default JumpballSection;
