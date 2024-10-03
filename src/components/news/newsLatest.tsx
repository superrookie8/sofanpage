import React from "react";
import { Article } from "@/types/articles";
import Image from "next/image";
import useFormatDate from "@/hooks/useFormatDate";

interface MainNewsProps {
	article: Article;
}

const MainNews: React.FC<MainNewsProps> = ({ article }) => {
	const formatDate = useFormatDate();
	return (
		<div
			className="flex-col items-center p-4 sm:text-xs"
			style={{ marginBottom: "2rem" }}
		>
			<div
				className="flex justify-center pb-4"
				style={{ position: "relative", width: "100%", height: "auto" }}
			>
				<Image
					src={article.image_url}
					alt={article.title}
					width={400}
					height={580}
					style={{ objectFit: "contain" }}
				/>
			</div>
			<p>{formatDate(article.created_at)}</p>
			<h2>{article.title}</h2>
			<p>{article.summary}</p>
			<div className="pt-4">
				<a
					href={article.link}
					className="flex justify-center inline-block px-4 py-2 border border-red-300 text-red-300 rounded"
				>
					더보기
				</a>
			</div>
		</div>
	);
};

export default MainNews;
