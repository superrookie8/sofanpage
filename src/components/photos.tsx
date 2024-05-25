import React from "react";
import Carousel from "./carousel";
import images from "./images";

interface Props {}

const Photos: React.FC<Props> = (props) => {
	return (
		<div>
			<Carousel images={images} />
		</div>
	);
};

export default Photos;
