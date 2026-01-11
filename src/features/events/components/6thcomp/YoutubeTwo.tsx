import React from "react";
const YoutubeTwo = () => {
	return (
		<div className="video-container max-w-[800px] mx-auto">
			<iframe
				className="absolute top-0 left-0 w-full h-full"
				src="https://www.youtube.com/embed/1fbwJGRmR38"
				title="YouTube video player"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			></iframe>
		</div>
	);
};

export default YoutubeTwo;
