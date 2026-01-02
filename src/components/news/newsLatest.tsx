import React from "react";
import { Article } from "@/types/articles";
import Image from "next/image";
import useFormatDate from "@/hooks/useFormatDate";

interface MainNewsProps {
	article: Article;
}

const MainNews: React.FC<MainNewsProps> = ({ article }) => {
	const formatDate = useFormatDate();
	
	if (!article) {
		return null;
	}
	
	return (
		<div
			className="flex-col items-center p-4 sm:text-xs"
			style={{ marginBottom: "2rem" }}
		>
			<div
				className="flex justify-center pb-4"
				style={{ position: "relative", width: "100%", height: "auto" }}
			>
				{article.imageUrl && (
					<Image
						src={article.imageUrl}
						alt={article.title || "기사 이미지"}
						width={400}
						height={580}
						style={{ objectFit: "contain" }}
					/>
				)}
			</div>
			{article.publishedAt && <p>{formatDate(article.publishedAt)}</p>}
			{article.title && <h2>{article.title}</h2>}
			{article.summary && <p>{article.summary}</p>}
			{article.url && (
				<div className="pt-4">
					<a
						href={article.url}
						className="flex justify-center inline-block px-4 py-2 border border-red-300 text-red-300 rounded"
					>
						더보기
					</a>
				</div>
			)}
		</div>
	);
};

export default MainNews;
