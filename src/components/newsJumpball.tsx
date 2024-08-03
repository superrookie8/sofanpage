import React from "react";
import { Article } from "@/types/articles";
import Image from "next/image";

interface JumpballProps {
	jumpballarticle: Article;
}

const JumpballSection: React.FC<JumpballProps> = ({ jumpballarticle }) => {
	return (
		<div>
			<div style={{ marginBottom: "2rem" }}>
				<Image
					src={jumpballarticle.image_url}
					alt={jumpballarticle.title}
					width={200}
					height={380}
					style={{ objectFit: "contain" }}
				/>
			</div>
			<h2>{jumpballarticle.title}</h2>
			<p>{jumpballarticle.summary}</p>
			<a href={jumpballarticle.link}></a>
		</div>
	);
};

export default JumpballSection;
