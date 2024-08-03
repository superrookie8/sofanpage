import React from "react";
import { Article } from "@/types/articles";
import Image from "next/image";

interface RookieProps {
	rookiearticle: Article;
}

const RookieSection: React.FC<RookieProps> = ({ rookiearticle }) => {
	return (
		<div>
			<div style={{ marginBottom: "2rem" }}>
				<Image
					src={rookiearticle.image_url}
					alt={rookiearticle.title}
					width={200}
					height={380}
					style={{ objectFit: "contain" }}
				/>
			</div>
			<h2>{rookiearticle.title}</h2>
			<p>{rookiearticle.summary}</p>
			<a href={rookiearticle.link}></a>
		</div>
	);
};

export default RookieSection;
