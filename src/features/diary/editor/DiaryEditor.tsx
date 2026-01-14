// src/features/diary/editor/DiaryEditor.tsx
"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BaseInfoSection } from "./components/BaseInfoSection";
import { MVPSection } from "./components/MVPSection";
import { PlayerStatsSection } from "./components/PlayerStatsSection";
import { HighlightsSection } from "./components/HighlightsSection";
import { PhotosMemoSection } from "./components/PhotosMemoSection";
import AlertModal from "@/shared/ui/alertModal";
import type { DiaryDraft, PlayerStats, StatKey } from "./types";
import { uid } from "./utils";

type DiaryEditorInitialDraft = Partial<
	Omit<DiaryDraft, "base" | "mvp" | "highlights" | "players">
> & {
	base?: Partial<DiaryDraft["base"]>;
	mvp?: Partial<DiaryDraft["mvp"]>;
	highlights?: Partial<DiaryDraft["highlights"]>;
	players?: PlayerStats[];
};

interface DiaryEditorProps {
	// create/edit 화면에서 필요한 값만 일부 주입할 수 있도록 deep-partial 형태로 받음
	initialDraft?: DiaryEditorInitialDraft;
	onSave?: (draft: DiaryDraft) => Promise<void>;
	onSaveDraft?: (draft: DiaryDraft) => Promise<void>;
}

export const DiaryEditor: React.FC<DiaryEditorProps> = ({
	initialDraft,
	onSave,
	onSaveDraft,
}) => {
	const router = useRouter();
	const [draft, setDraft] = useState<DiaryDraft>(() => ({
		base: {
			date: "",
			time: "",
			location: "",
			watchType: "직관",
			companions: "",
			result: "승",
			...initialDraft?.base,
		},
		mvp: {
			name: "",
			reason: "",
			...initialDraft?.mvp,
		},
		players: initialDraft?.players?.length
			? initialDraft.players
			: [
					{
						id: uid(),
						name: "",
						team: "",
						stats: {
							pts: "",
							fg2Made: "",
							fg2Att: "",
							fg3Made: "",
							fg3Att: "",
							rebOff: "",
							rebDef: "",
							ast: "",
							stl: "",
							blk: "",
							to: "",
						},
					},
			  ],
		highlights: {
			overtime: false,
			injury: false,
			referee: false,
			bestMood: false,
			worstMood: false,
			custom: "",
			...initialDraft?.highlights,
		},
		ticketPhoto: initialDraft?.ticketPhoto || "",
		viewPhoto: initialDraft?.viewPhoto || "",
		additionalPhoto: initialDraft?.additionalPhoto || "",
		memo: initialDraft?.memo || "",
	}));

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [modalMessage, setModalMessage] = useState("");
	const [modalOpen, setModalOpen] = useState(false);

	const canSave = useMemo(() => {
		// minimal: date + location
		return Boolean(draft.base.date && draft.base.location);
	}, [draft.base.date, draft.base.location]);

	const addPlayer = () => {
		setDraft((d) => ({
			...d,
			players: [
				...d.players,
				{
					id: uid(),
					name: "",
					team: "",
					stats: {
						pts: "",
						fg2Made: "",
						fg2Att: "",
						fg3Made: "",
						fg3Att: "",
						rebOff: "",
						rebDef: "",
						ast: "",
						stl: "",
						blk: "",
						to: "",
					},
				},
			],
		}));
	};

	const removePlayer = (id: string) => {
		setDraft((d) => ({
			...d,
			players: d.players.filter((p) => p.id !== id),
		}));
	};

	const updatePlayer = (id: string, patch: Partial<PlayerStats>) => {
		setDraft((d) => ({
			...d,
			players: d.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
		}));
	};

	const updatePlayerStat = (id: string, key: StatKey, value: number | "") => {
		setDraft((d) => ({
			...d,
			players: d.players.map((p) =>
				p.id === id
					? {
							...p,
							stats: {
								...p.stats,
								[key]: value,
							},
					  }
					: p
			),
		}));
	};

	const handleSave = async () => {
		if (!canSave) return;
		if (!onSave) {
			setModalMessage("저장 기능은 아직 구현되지 않았습니다.");
			setModalOpen(true);
			return;
		}

		setIsSaving(true);
		try {
			await onSave(draft);
			setModalMessage("일지가 성공적으로 저장되었습니다.");
			setModalOpen(true);
		} catch (error) {
			setModalMessage(
				error instanceof Error ? error.message : "저장 중 오류가 발생했습니다."
			);
			setModalOpen(true);
		} finally {
			setIsSaving(false);
		}
	};

	const handleSaveDraft = async () => {
		if (!onSaveDraft) {
			setModalMessage("임시저장 기능은 아직 구현되지 않았습니다.");
			setModalOpen(true);
			return;
		}

		setIsSaving(true);
		try {
			await onSaveDraft(draft);
			setModalMessage("임시저장이 완료되었습니다.");
			setModalOpen(true);
		} catch (error) {
			setModalMessage(
				error instanceof Error
					? error.message
					: "임시저장 중 오류가 발생했습니다."
			);
			setModalOpen(true);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 relative">
			{/* Top Bar */}
			<div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
				<div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => router.back()}
							className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md transition"
						>
							← 목록으로
						</button>
						<div className="h-5 w-px bg-gray-300" />
						<div>
							<div className="text-sm text-gray-500">직관일지 작성</div>
							<div className="font-semibold leading-tight">
								오늘의 경기를 기록해요
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={handleSaveDraft}
							disabled={isSaving}
							className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
						>
							임시저장
						</button>
						<button
							type="button"
							onClick={handleSave}
							disabled={!canSave || isSaving}
							className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSaving ? "저장 중..." : "저장"}
						</button>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="mx-auto max-w-5xl px-4 py-6">
				<div className="grid gap-6">
					<BaseInfoSection
						base={draft.base}
						onChange={(base) => setDraft((d) => ({ ...d, base }))}
					/>

					<MVPSection
						mvp={draft.mvp}
						onChange={(mvp) => setDraft((d) => ({ ...d, mvp }))}
					/>

					<PlayerStatsSection
						players={draft.players}
						onAddPlayer={addPlayer}
						onRemovePlayer={removePlayer}
						onUpdatePlayer={updatePlayer}
						onUpdatePlayerStat={updatePlayerStat}
					/>

					<HighlightsSection
						highlights={draft.highlights}
						onChange={(highlights) => setDraft((d) => ({ ...d, highlights }))}
					/>

					<PhotosMemoSection
						ticketPhoto={draft.ticketPhoto}
						viewPhoto={draft.viewPhoto}
						additionalPhoto={draft.additionalPhoto}
						memo={draft.memo}
						onTicketPhotoChange={(r2Key) =>
							setDraft((d) => ({ ...d, ticketPhoto: r2Key }))
						}
						onViewPhotoChange={(r2Key) =>
							setDraft((d) => ({ ...d, viewPhoto: r2Key }))
						}
						onAdditionalPhotoChange={(r2Key) =>
							setDraft((d) => ({ ...d, additionalPhoto: r2Key }))
						}
						onMemoChange={(memo) => setDraft((d) => ({ ...d, memo }))}
					/>

					{/* Footer spacing */}
					<div className="h-6" />
				</div>
			</div>

			<AlertModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				message={modalMessage}
			/>
		</div>
	);
};
