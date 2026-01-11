// src/features/diary/editor/components/PlayerStatsSection.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionTitle } from "./SectionTitle";
import { NumberInput } from "./NumberInput";
import { pct } from "../utils";
import { statMeta } from "../constants";
import type { PlayerStats, StatKey } from "../types";

interface PlayerStatsSectionProps {
	players: PlayerStats[];
	onAddPlayer: () => void;
	onRemovePlayer: (id: string) => void;
	onUpdatePlayer: (id: string, patch: Partial<PlayerStats>) => void;
	onUpdatePlayerStat: (id: string, key: StatKey, value: number | "") => void;
}

export const PlayerStatsSection: React.FC<PlayerStatsSectionProps> = ({
	players,
	onAddPlayer,
	onRemovePlayer,
	onUpdatePlayer,
	onUpdatePlayerStat,
}) => {
	const grouped = React.useMemo(() => {
		const map: Record<string, typeof statMeta> = {} as any;
		for (const m of statMeta) {
			(map[m.group] ??= []).push(m as any);
		}
		return map;
	}, []);

	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-5">
			<div className="flex items-start justify-between gap-4">
				<SectionTitle
					icon={<span className="text-xl">👤</span>}
					title="응원 선수 기록"
					desc="기록하고 싶은 선수만 추가해도 돼요. (선수별 카드)"
				/>
				<button
					type="button"
					onClick={onAddPlayer}
					className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
				>
					<span>➕</span> 선수 추가
				</button>
			</div>

			<div className="mt-5 grid gap-4">
				<AnimatePresence initial={false}>
					{players.map((p) => {
						const fg2 = pct(p.stats.fg2Made, p.stats.fg2Att);
						const fg3 = pct(p.stats.fg3Made, p.stats.fg3Att);
						return (
							<motion.div
								key={p.id}
								layout
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								transition={{ duration: 0.2 }}
							>
								<div className="rounded-2xl border border-gray-200 bg-white">
									<div className="p-4 flex items-start justify-between gap-3">
										<div className="grid gap-3 md:grid-cols-3 w-full">
											<div className="space-y-2">
												<div className="text-sm text-gray-500">선수</div>
												<input
													type="text"
													placeholder="이름"
													value={p.name}
													onChange={(e) =>
														onUpdatePlayer(p.id, { name: e.target.value })
													}
													className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
												/>
											</div>
											<div className="space-y-2">
												<div className="text-sm text-gray-500">팀(선택)</div>
												<input
													type="text"
													placeholder="예: BNK SUM"
													value={p.team ?? ""}
													onChange={(e) =>
														onUpdatePlayer(p.id, { team: e.target.value })
													}
													className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
												/>
											</div>
											<div className="space-y-2">
												<div className="text-sm text-gray-500">슈팅 요약</div>
												<div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
													<div className="flex items-center justify-between">
														<span className="text-gray-500">2P</span>
														<span className="font-medium">{fg2}</span>
													</div>
													<div className="flex items-center justify-between mt-2">
														<span className="text-gray-500">3P</span>
														<span className="font-medium">{fg3}</span>
													</div>
												</div>
											</div>
										</div>
										{players.length > 1 ? (
											<button
												type="button"
												onClick={() => onRemovePlayer(p.id)}
												className="shrink-0 p-2 hover:bg-gray-100 rounded-md transition"
												aria-label="remove player"
											>
												<span className="text-gray-500">🗑️</span>
											</button>
										) : null}
									</div>

									<div className="px-4 pb-4">
										<div className="grid gap-4 md:grid-cols-2">
											{Object.entries(grouped).map(([groupName, metas]) => (
												<div
													key={groupName}
													className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
												>
													<div className="text-sm font-semibold">{groupName}</div>
													<div className="mt-3 grid grid-cols-2 gap-3">
														{metas.map((m) => (
															<div key={m.key} className="space-y-2">
																<div className="text-xs text-gray-500">
																	{m.label}
																</div>
																<NumberInput
																	value={p.stats[m.key]}
																	onChange={(v) =>
																		onUpdatePlayerStat(p.id, m.key, v)
																	}
																	placeholder=""
																/>
															</div>
														))}
													</div>
												</div>
											))}
										</div>

										<div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
											<div className="text-sm font-semibold">
												자동 계산(미리보기)
											</div>
											<div className="mt-2 grid gap-2 text-sm">
												<div className="flex items-center justify-between">
													<span className="text-gray-500">2점 야투율</span>
													<span className="font-medium">{fg2}</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-gray-500">3점 야투율</span>
													<span className="font-medium">{fg3}</span>
												</div>
											</div>
											<div className="mt-2 text-xs text-gray-500">
												* 야투율은 (성공/시도) 기반으로 간단 계산한 미리보기입니다.
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						);
					})}
				</AnimatePresence>
			</div>
		</div>
	);
};
