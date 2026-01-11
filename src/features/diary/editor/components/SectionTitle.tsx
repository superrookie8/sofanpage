// src/features/diary/editor/components/SectionTitle.tsx
import React from "react";

interface SectionTitleProps {
	icon: React.ReactNode;
	title: string;
	desc?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
	icon,
	title,
	desc,
}) => {
	return (
		<div className="flex items-start gap-3">
			<div className="mt-0.5 text-gray-500">{icon}</div>
			<div>
				<div className="text-lg font-semibold leading-tight">{title}</div>
				{desc ? (
					<div className="text-sm text-gray-500 mt-1">{desc}</div>
				) : null}
			</div>
		</div>
	);
};
