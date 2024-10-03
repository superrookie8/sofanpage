import { sectionData } from "@/data/seatingData";
import React from "react";

interface SelectedSectionProps {
	section: string;
	location: string;
}

const SelectedSection: React.FC<SelectedSectionProps> = ({
	section,
	location,
}) => {
	const sectionLabels = sectionData[location]?.[section] || "선택";

	return (
		<div className="text-xs">
			<span className="text-xs">{sectionLabels}</span>
		</div>
	);
};

export default SelectedSection;
