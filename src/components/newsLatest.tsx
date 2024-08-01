import React from "react";
import { Article } from "@/types/articles";
import Image from "next/image";

interface MainNewsProps {
	article: Article;
}

const MainNews: React.FC<MainNewsProps> = ({ article }) => {
	return (
		<div style={{ marginBottom: "2rem" }}>
			<h1> Main Article</h1>
			<div style={{ position: "relative", width: "100%", height: "auto" }}>
				<Image
					src={article.image_url}
					alt={article.title}
					width={200}
					height={380}
					style={{ objectFit: "contain" }}
				/>
			</div>
			<h2>{article.title}</h2>
			<p>{article.summary}</p>
			<a href={article.link}>Read more</a>
		</div>
	);
};

export default MainNews;
