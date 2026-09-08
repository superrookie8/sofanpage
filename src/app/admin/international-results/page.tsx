"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Category = "NATIONAL_TEAM" | "CLUB" | "EXHIBITION";
type ResultStatus = "SCHEDULED" | "IN_PROGRESS" | "FINAL";
type ParticipationStatus = "UNCONFIRMED" | "CONFIRMED";
type SourceType = "OFFICIAL" | "SECONDARY";

type Source = { label: string; url: string; type: SourceType };
type InternationalResult = {
	id: string;
	competitionKey: string;
	competitionName: string;
	editionLabel: string;
	category: Category;
	status: ResultStatus;
	participationStatus: ParticipationStatus;
	startDate: string;
	endDate: string;
	location: string;
	teamName: string;
	teamResult: string | null;
	teamRecord: string | null;
	gamesPlayed: number | null;
	minutesPerGame: string | null;
	pointsPerGame: number | null;
	reboundsPerGame: number | null;
	assistsPerGame: number | null;
	stealsPerGame: number | null;
	fieldGoalPercent: number | null;
	threePointPercent: number | null;
	freeThrowPercent: number | null;
	highlight: string | null;
	statsUpdatedThrough: string | null;
	sources: Source[];
	published: boolean;
	displayOrder: number;
	createdAt?: string;
	updatedAt?: string;
};

type Draft = Omit<InternationalResult, "id" | "createdAt" | "updatedAt">;
type NumericKey = "pointsPerGame" | "reboundsPerGame" | "assistsPerGame" | "stealsPerGame" | "fieldGoalPercent" | "threePointPercent" | "freeThrowPercent";

const categoryLabels: Record<Category, string> = { NATIONAL_TEAM: "성인 국가대표", CLUB: "구단 국제대회", EXHIBITION: "평가전" };
const statusLabels: Record<ResultStatus, string> = { SCHEDULED: "예정", IN_PROGRESS: "진행 중", FINAL: "종료" };
const participationLabels: Record<ParticipationStatus, string> = { UNCONFIRMED: "출전 미확정", CONFIRMED: "출전 확정" };
const numericFields: Array<{ key: NumericKey; label: string; min?: number; max?: number }> = [
	{ key: "pointsPerGame", label: "평균 득점", min: 0 },
	{ key: "reboundsPerGame", label: "평균 리바운드", min: 0 },
	{ key: "assistsPerGame", label: "평균 어시스트", min: 0 },
	{ key: "stealsPerGame", label: "평균 스틸", min: 0 },
	{ key: "fieldGoalPercent", label: "야투 성공률(%)", min: 0, max: 100 },
	{ key: "threePointPercent", label: "3점 성공률(%)", min: 0, max: 100 },
	{ key: "freeThrowPercent", label: "자유투 성공률(%)", min: 0, max: 100 },
];

function emptyDraft(): Draft {
	return {
		competitionKey: "", competitionName: "", editionLabel: "", category: "NATIONAL_TEAM",
		status: "FINAL", participationStatus: "CONFIRMED", startDate: "", endDate: "", location: "",
		teamName: "대한민국", teamResult: null, teamRecord: null, gamesPlayed: null, minutesPerGame: null,
		pointsPerGame: null, reboundsPerGame: null, assistsPerGame: null, stealsPerGame: null,
		fieldGoalPercent: null, threePointPercent: null, freeThrowPercent: null, highlight: null,
		statsUpdatedThrough: null, sources: [{ label: "", url: "", type: "OFFICIAL" }], published: false, displayOrder: 0,
	};
}

function optional(value: string): string | null {
	const trimmed = value.trim();
	return trimmed ? trimmed : null;
}

function validate(draft: Draft): string | null {
	if (!draft.competitionKey.trim()) return "대회 식별 키를 입력해 주세요.";
	if (!/^[a-z0-9][a-z0-9-]*$/.test(draft.competitionKey)) return "대회 식별 키는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.";
	if (!draft.competitionName.trim()) return "대회명을 입력해 주세요.";
	if (!draft.editionLabel.trim()) return "대회 연도·회차를 입력해 주세요.";
	if (!draft.startDate || !draft.endDate) return "대회 시작일과 종료일을 입력해 주세요.";
	if (draft.endDate < draft.startDate) return "종료일은 시작일보다 빠를 수 없습니다.";
	if (!draft.location.trim()) return "개최 장소를 입력해 주세요.";
	if (!draft.teamName.trim()) return "출전 팀을 입력해 주세요.";
	if (draft.status === "FINAL" && (!draft.teamResult?.trim() || draft.gamesPlayed === null)) return "종료된 대회는 팀 성적과 출전 경기 수를 입력해 주세요.";
	if (draft.status === "IN_PROGRESS" && !draft.statsUpdatedThrough) return "진행 중인 대회는 기록 기준일을 입력해 주세요.";
	if (draft.gamesPlayed !== null && draft.gamesPlayed < 0) return "출전 경기 수는 0 이상이어야 합니다.";
	for (const field of numericFields) {
		const value = draft[field.key];
		if (value !== null && ((field.min !== undefined && value < field.min) || (field.max !== undefined && value > field.max))) return `${field.label} 값을 확인해 주세요.`;
	}
	if (!draft.sources.length) return "출처를 한 개 이상 등록해 주세요.";
	for (const source of draft.sources) {
		if (!source.label.trim() || !source.url.trim()) return "모든 출처의 이름과 URL을 입력해 주세요.";
		try { if (new URL(source.url).protocol !== "https:") throw new Error(); } catch { return "출처 URL은 https 주소로 입력해 주세요."; }
	}
	return null;
}

function errorMessage(body: unknown, fallback: string) {
	if (body && typeof body === "object" && "message" in body && typeof body.message === "string") return body.message;
	return fallback;
}

export default function InternationalResultsAdminPage() {
	const [items, setItems] = useState<InternationalResult[]>([]);
	const [draft, setDraft] = useState<Draft>(() => emptyDraft());
	const [editingId, setEditingId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const headingRef = useRef<HTMLHeadingElement>(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/admin/international-results", { cache: "no-store" });
			const body = await response.json().catch(() => null);
			if (!response.ok) throw new Error(errorMessage(body, "국제대회 기록을 불러오지 못했습니다."));
			const records = Array.isArray(body) ? body : body && typeof body === "object" && "content" in body && Array.isArray(body.content) ? body.content : [];
			setItems(records);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "국제대회 기록을 불러오지 못했습니다.");
		} finally { setLoading(false); }
	}, []);

	useEffect(() => { void load(); }, [load]);

	const orderedItems = useMemo(() => [...items].sort((a, b) => a.displayOrder - b.displayOrder || b.startDate.localeCompare(a.startDate)), [items]);

	const reset = () => {
		setDraft(emptyDraft());
		setEditingId(null);
		setError(null);
	};

	const edit = (item: InternationalResult) => {
		const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = item;
		setDraft({ ...input, sources: input.sources.map((source) => ({ ...source })) });
		setEditingId(item.id);
		setError(null);
		setNotice(null);
		requestAnimationFrame(() => headingRef.current?.focus());
	};

	const changeText = (key: keyof Draft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
	const changeOptional = (key: keyof Draft, value: string) => setDraft((current) => ({ ...current, [key]: optional(value) }));
	const changeNumber = (key: NumericKey | "gamesPlayed" | "displayOrder", value: string) => setDraft((current) => ({ ...current, [key]: value === "" ? (key === "displayOrder" ? 0 : null) : Number(value) }));

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		setError(null); setNotice(null);
		const validation = validate(draft);
		if (validation) { setError(validation); return; }
		setSaving(true);
		try {
			const response = await fetch(editingId ? `/api/admin/international-results/${encodeURIComponent(editingId)}` : "/api/admin/international-results", {
				method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft),
			});
			const body = await response.json().catch(() => null);
			if (!response.ok) throw new Error(errorMessage(body, editingId ? "기록 수정을 저장하지 못했습니다." : "기록을 등록하지 못했습니다."));
			setNotice(editingId ? "국제대회 기록을 수정했습니다." : "국제대회 기록을 등록했습니다.");
			reset();
			await load();
		} catch (caught) { setError(caught instanceof Error ? caught.message : "저장 중 오류가 발생했습니다."); }
		finally { setSaving(false); }
	};

	const remove = async (item: InternationalResult) => {
		if (!window.confirm(`“${item.editionLabel} ${item.competitionName}” 기록을 삭제할까요? 삭제 후에는 관리자 화면에서 복구할 수 없습니다.`)) return;
		setDeletingId(item.id); setError(null); setNotice(null);
		try {
			const response = await fetch(`/api/admin/international-results/${encodeURIComponent(item.id)}`, { method: "DELETE" });
			const body = response.status === 204 ? null : await response.json().catch(() => null);
			if (!response.ok) throw new Error(errorMessage(body, "기록을 삭제하지 못했습니다."));
			if (editingId === item.id) reset();
			setNotice("국제대회 기록을 삭제했습니다.");
			await load();
		} catch (caught) { setError(caught instanceof Error ? caught.message : "삭제 중 오류가 발생했습니다."); }
		finally { setDeletingId(null); }
	};

	return <div className="international-admin">
		<section className="international-admin-heading">
			<div><span>CAREER DATA</span><h2>국제대회 성적 관리</h2><p>국가대표, 구단 국제대회, 평가전 성적과 공개 순서를 관리합니다.</p></div>
			<div><strong>{items.length}</strong><small>등록된 대회</small></div>
		</section>

		{notice && <p className="international-admin-notice" role="status">{notice}</p>}
		{error && <p className="international-admin-error" role="alert">{error}</p>}

		<div className="international-admin-layout">
			<form className="international-admin-form" onSubmit={submit}>
				<div className="international-admin-form-title"><div><span>{editingId ? "EDIT RESULT" : "NEW RESULT"}</span><h3 ref={headingRef} tabIndex={-1}>{editingId ? "국제대회 기록 수정" : "새 국제대회 기록"}</h3></div>{editingId && <button type="button" onClick={reset}>수정 취소</button>}</div>

				<fieldset><legend>대회 정보</legend><div className="international-admin-fields">
					<label><span>대회 식별 키 *</span><input value={draft.competitionKey} onChange={(e) => changeText("competitionKey", e.target.value)} placeholder="fiba-wc-2026" required /></label>
					<label><span>대회명 *</span><input value={draft.competitionName} onChange={(e) => changeText("competitionName", e.target.value)} required /></label>
					<label><span>연도·회차 *</span><input value={draft.editionLabel} onChange={(e) => changeText("editionLabel", e.target.value)} placeholder="2026" required /></label>
					<label><span>분류 *</span><select value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as Category }))}>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
					<label><span>대회 상태 *</span><select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as ResultStatus }))}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
					<label><span>출전 상태 *</span><select value={draft.participationStatus} onChange={(e) => setDraft((d) => ({ ...d, participationStatus: e.target.value as ParticipationStatus }))}>{Object.entries(participationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
					<label><span>시작일 *</span><input type="date" value={draft.startDate} onChange={(e) => changeText("startDate", e.target.value)} required /></label>
					<label><span>종료일 *</span><input type="date" value={draft.endDate} onChange={(e) => changeText("endDate", e.target.value)} required /></label>
					<label><span>개최 장소 *</span><input value={draft.location} onChange={(e) => changeText("location", e.target.value)} required /></label>
					<label><span>출전 팀 *</span><input value={draft.teamName} onChange={(e) => changeText("teamName", e.target.value)} required /></label>
				</div></fieldset>

				<fieldset><legend>팀·개인 기록</legend><div className="international-admin-fields">
					<label><span>팀 최종 성적 {draft.status === "FINAL" ? "*" : ""}</span><input value={draft.teamResult ?? ""} onChange={(e) => changeOptional("teamResult", e.target.value)} placeholder="3위" /></label>
					<label><span>팀 전적</span><input value={draft.teamRecord ?? ""} onChange={(e) => changeOptional("teamRecord", e.target.value)} placeholder="3승 2패" /></label>
					<label><span>출전 경기 수 {draft.status === "FINAL" ? "*" : ""}</span><input type="number" min="0" step="1" value={draft.gamesPlayed ?? ""} onChange={(e) => changeNumber("gamesPlayed", e.target.value)} /></label>
					<label><span>평균 출전시간</span><input value={draft.minutesPerGame ?? ""} onChange={(e) => changeOptional("minutesPerGame", e.target.value)} placeholder="25.5분 또는 25:30" /></label>
					{numericFields.map((field) => <label key={field.key}><span>{field.label}</span><input type="number" min={field.min} max={field.max} step="0.1" value={draft[field.key] ?? ""} onChange={(e) => changeNumber(field.key, e.target.value)} /></label>)}
					<label><span>기록 기준일 {draft.status === "IN_PROGRESS" ? "*" : ""}</span><input type="date" value={draft.statsUpdatedThrough ?? ""} onChange={(e) => changeOptional("statsUpdatedThrough", e.target.value)} /></label>
					<label className="is-wide"><span>주요 활약</span><textarea value={draft.highlight ?? ""} onChange={(e) => changeOptional("highlight", e.target.value)} placeholder="대회에서 보여준 주요 활약을 간결하게 작성해 주세요." /></label>
				</div></fieldset>

				<fieldset><legend>출처</legend><div className="international-admin-sources">
					{draft.sources.map((source, index) => <div key={index} className="international-admin-source"><label><span>출처 이름 *</span><input value={source.label} onChange={(e) => setDraft((d) => ({ ...d, sources: d.sources.map((s, i) => i === index ? { ...s, label: e.target.value } : s) }))} /></label><label><span>URL *</span><input type="url" value={source.url} onChange={(e) => setDraft((d) => ({ ...d, sources: d.sources.map((s, i) => i === index ? { ...s, url: e.target.value } : s) }))} placeholder="https://" /></label><label><span>출처 유형</span><select value={source.type} onChange={(e) => setDraft((d) => ({ ...d, sources: d.sources.map((s, i) => i === index ? { ...s, type: e.target.value as SourceType } : s) }))}><option value="OFFICIAL">공식</option><option value="SECONDARY">보조</option></select></label><button type="button" disabled={draft.sources.length === 1} onClick={() => setDraft((d) => ({ ...d, sources: d.sources.filter((_, i) => i !== index) }))}>삭제</button></div>)}
					<button className="international-admin-add-source" type="button" onClick={() => setDraft((d) => ({ ...d, sources: [...d.sources, { label: "", url: "", type: "OFFICIAL" }] }))}>+ 출처 추가</button>
				</div></fieldset>

				<div className="international-admin-publish"><label><input type="checkbox" checked={draft.published} onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))} /><span><strong>공개</strong><small>저장 즉시 팬페이지에 표시합니다.</small></span></label><label><span>표시 순서</span><input type="number" step="1" value={draft.displayOrder} onChange={(e) => changeNumber("displayOrder", e.target.value)} /></label></div>
				<button className="international-admin-submit" type="submit" disabled={saving}>{saving ? "저장 중…" : editingId ? "수정 내용 저장" : "국제대회 기록 등록"}</button>
			</form>

			<section className="international-admin-list" aria-busy={loading}>
				<div className="international-admin-list-title"><div><span>RESULT LIST</span><h3>등록된 기록</h3></div><button type="button" onClick={() => void load()} disabled={loading}>{loading ? "불러오는 중…" : "새로고침"}</button></div>
				{!loading && !orderedItems.length && <p className="international-admin-empty">등록된 국제대회 기록이 없습니다.</p>}
				{orderedItems.map((item) => <article key={item.id} className="international-admin-item"><div className="international-admin-item-top"><div><span>{categoryLabels[item.category]}</span><h4>{item.editionLabel} {item.competitionName}</h4><p>{item.startDate} – {item.endDate} · {item.location}</p></div><strong className={item.published ? "is-published" : ""}>{item.published ? "공개" : "비공개"}</strong></div><div className="international-admin-tags"><span>{statusLabels[item.status]}</span><span>{participationLabels[item.participationStatus]}</span><span>순서 {item.displayOrder}</span>{item.teamResult && <span>{item.teamResult}</span>}</div><p className="international-admin-item-stat">{item.gamesPlayed === null ? "개인 기록 미입력" : `${item.gamesPlayed}경기 · ${item.pointsPerGame ?? "-"}점 · ${item.reboundsPerGame ?? "-"}리바운드 · ${item.assistsPerGame ?? "-"}어시스트`}</p>{item.highlight && <p className="international-admin-highlight">{item.highlight}</p>}<div className="international-admin-item-actions"><button type="button" onClick={() => edit(item)}>수정</button><button type="button" className="is-delete" disabled={deletingId === item.id} onClick={() => void remove(item)}>{deletingId === item.id ? "삭제 중…" : "삭제"}</button></div></article>)}
			</section>
		</div>
	</div>;
}
