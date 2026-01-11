// src/features/diary/editor/components/MVPSection.tsx
import React from "react";
import { SectionTitle } from "./SectionTitle";
import type { MVP } from "../types";

interface MVPSectionProps {
	mvp: MVP;
	onChange: (mvp: MVP) => void;
}

export const MVPSection: React.FC<MVPSectionProps> = ({ mvp, onChange }) => {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-5">
			<SectionTitle
				icon={<span className="text-xl">⭐</span>}
				title="오늘의 MVP"
				desc="그날 경기를 한 줄로 요약하는 느낌으로 남겨요."
			/>
			<div className="mt-5 grid gap-4 md:grid-cols-3">
				<div className="space-y-2 md:col-span-1">
					<div className="text-sm text-gray-500 flex items-center gap-2">
						<span>👤</span> MVP
					</div>
					<input
						type="text"
						placeholder="선수 이름"
						value={mvp.name}
						onChange={(e) => onChange({ ...mvp, name: e.target.value })}
						className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					/>
				</div>
				<div className="space-y-2 md:col-span-2">
					<div className="text-sm text-gray-500">이유(선택)</div>
					<input
						type="text"
						placeholder="예: 4쿼터 클러치로 분위기를 바꿈"
						value={mvp.reason}
						onChange={(e) => onChange({ ...mvp, reason: e.target.value })}
						className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					/>
				</div>
			</div>
		</div>
	);
};
