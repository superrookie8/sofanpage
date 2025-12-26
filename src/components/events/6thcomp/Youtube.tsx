import React from "react";
import Link from "next/link";
import Image from "next/image";
const Youtube = () => {
	return (
		<div className="video-container max-w-[800px] mx-auto">
			<iframe
				className="absolute top-0 left-0 w-full h-full"
				src="https://www.youtube.com/embed/lf8ugRgmgbc"
				title="YouTube video player"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			></iframe>
		</div>
	);
};

export default Youtube;
