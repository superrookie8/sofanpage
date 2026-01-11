// src/features/diary/editor/components/HighlightsSection.tsx
import React from "react";
import { SectionTitle } from "./SectionTitle";
import { Chip } from "./Chip";
import type { Highlights } from "../types";

interface HighlightsSectionProps {
	highlights: Highlights;
	onChange: (highlights: Highlights) => void;
}

export const HighlightsSection: React.FC<HighlightsSectionProps> = ({
	highlights,
	onChange,
}) => {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-5">
			<SectionTitle
				icon={<span className="text-xl">✨</span>}
				title="특이사항"
				desc="체크 몇 번으로 그날의 분위기를 남겨요."
			/>
			<div className="mt-5 flex flex-wrap gap-2">
				<Chip
					active={highlights.overtime}
					onClick={() =>
						onChange({ ...highlights, overtime: !highlights.overtime })
					}
				>
					연장전
				</Chip>
				<Chip
					active={highlights.injury}
					onClick={() =>
						onChange({ ...highlights, injury: !highlights.injury })
					}
				>
					부상 이슈
				</Chip>
				<Chip
					active={highlights.referee}
					onClick={() =>
						onChange({ ...highlights, referee: !highlights.referee })
					}
				>
					판정 이슈
				</Chip>
				<Chip
					active={highlights.bestMood}
					onClick={() =>
						onChange({ ...highlights, bestMood: !highlights.bestMood })
					}
				>
					분위기 최고
				</Chip>
				<Chip
					active={highlights.worstMood}
					onClick={() =>
						onChange({ ...highlights, worstMood: !highlights.worstMood })
					}
				>
					분위기 최악
				</Chip>
			</div>

			<div className="mt-4">
				<div className="text-sm text-gray-500">기타(선택)</div>
				<input
					type="text"
					className="mt-2 w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
					placeholder="예: 4쿼터에 갑자기 응원가가 터짐"
					value={highlights.custom}
					onChange={(e) =>
						onChange({ ...highlights, custom: e.target.value })
					}
				/>
			</div>
		</div>
	);
};
