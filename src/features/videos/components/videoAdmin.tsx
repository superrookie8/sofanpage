"use client";

import { FormEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import approvedData from "../approved-videos.json";
import { youtubeId } from "../links";
import { VIDEO_CATEGORIES, type Video, type VideoInput, type VideoPage } from "../types";
import styles from "./videoAdmin.module.css";

const approved = approvedData as VideoInput[];
const blank = (): VideoInput => ({ id: "", title: "", channelName: "", category: "highlights", eventDate: null, eventKey: null, eventLabel: "", eventDateBasis: null, leeFocused: false, displayOrder: 0, published: false, duration: null, badge: null, verifiedOn: null, thumbnailUrl: null });

async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
	const response = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
	const result = response.status === 204 ? null : await response.json().catch(() => null);
	if (!response.ok) throw new Error(result?.message || "영상 요청을 처리하지 못했습니다.");
	return result as T;
}

export default function VideoAdmin() {
	const client = useQueryClient();
	const [page, setPage] = useState(0);
	const query = useQuery({ queryKey: ["admin-videos", page], queryFn: () => request<VideoPage>(`/api/admin/videos?page=${page}&limit=20`) });
	const [draft, setDraft] = useState<VideoInput>(blank);
	const [editing, setEditing] = useState(false);
	const [link, setLink] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [preview, setPreview] = useState(false);
	const reset = () => { setDraft(blank()); setLink(""); setEditing(false); };
	const change = <K extends keyof VideoInput>(key: K, value: VideoInput[K]) => setDraft((current) => ({ ...current, [key]: value }));
	const refresh = async () => {
		await Promise.all([client.invalidateQueries({ queryKey: ["admin-videos"] }), client.invalidateQueries({ queryKey: ["videos"] })]);
	};
	const perform = async (action: () => Promise<string>) => {
		setBusy(true); setError(""); setNotice("");
		try { setNotice(await action()); await refresh(); }
		catch (caught) { setError(caught instanceof Error ? caught.message : "요청에 실패했습니다."); }
		finally { setBusy(false); }
	};
	const save = (event: FormEvent) => {
		event.preventDefault();
		const id = editing ? draft.id : youtubeId(link);
		if (!id) { setError("YouTube 링크 또는 11자리 영상 ID를 확인해주세요."); return; }
		void perform(async () => {
			await request(editing ? `/api/admin/videos/${id}` : "/api/admin/videos", editing ? "PUT" : "POST", { ...draft, id });
			reset(); return "영상을 저장했습니다.";
		});
	};
	const edit = (video: Video) => {
		const next = blank();
		for (const key of Object.keys(next) as Array<keyof VideoInput>) Object.assign(next, { [key]: video[key] });
		setDraft(next); setLink(video.id); setEditing(true); setError(""); setNotice("");
		document.getElementById("video-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
		document.getElementById("video-title")?.focus({ preventScroll: true });
	};
	return <div className={styles.page}>
		<header><p>VIDEO LIBRARY</p><h2>YouTube 영상 관리</h2><span>링크와 영상 정보를 등록하고 공개 여부를 관리합니다.</span></header>
		{error && <p className={styles.error} role="alert">{error}</p>}
		{notice && <p className={styles.notice} role="status">{notice}</p>}
		<section className={styles.import} aria-label="승인된 영상 등록">
			<h3>아시안게임 영상 {approved.length}개</h3><p>검토한 목록을 확인한 뒤 한 번에 등록할 수 있습니다. 이미 등록된 영상은 유지됩니다.</p>
			<button type="button" onClick={() => setPreview(!preview)} aria-expanded={preview}>{preview ? "목록 접기" : "등록할 목록 보기"}</button>
			{preview && <><ol>{approved.map((video) => <li key={video.id}><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">{video.title}</a><small>{VIDEO_CATEGORIES[video.category]} · {video.channelName} · {video.eventDate} · 공개</small></li>)}</ol>
				<button type="button" disabled={busy} onClick={() => { void perform(async () => {
					const result = await request<{ processed: number; created: number; existing: number }>("/api/admin/videos/import", "POST", { videos: approved });
					return `${result.processed}개 처리: 신규 ${result.created}개 등록, 기존 ${result.existing}개 유지`;
				}); }}>확인한 {approved.length}개 영상 등록</button></>}
		</section>
		<div className={styles.layout}>
			<form id="video-editor" className={styles.panel} onSubmit={save}>
				<h3>{editing ? "영상 수정" : "새 영상"}</h3>
				<fieldset disabled={busy}>
					<label>YouTube 링크 또는 ID<input required value={link} onChange={(e) => setLink(e.target.value)} readOnly={editing} placeholder="https://www.youtube.com/watch?v=…" /></label>
					<label>제목<input id="video-title" required maxLength={300} value={draft.title} onChange={(e) => change("title", e.target.value)} /></label>
					<label>채널명<input required maxLength={100} value={draft.channelName} onChange={(e) => change("channelName", e.target.value)} /></label>
					<label>분류<select value={draft.category} onChange={(e) => change("category", e.target.value as VideoInput["category"])}>{Object.entries(VIDEO_CATEGORIES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
					<label>경기·행사명<input required maxLength={120} value={draft.eventLabel} onChange={(e) => change("eventLabel", e.target.value)} placeholder="준결승 · 중국전" /></label>
					<label>경기·행사 날짜<input type="date" value={draft.eventDate ?? ""} onChange={(e) => change("eventDate", e.target.value || null)} /><small>영상 게시일이 아닙니다. 모르면 비워두세요.</small></label>
					<label>날짜 확인 근거<input maxLength={300} value={draft.eventDateBasis ?? ""} onChange={(e) => change("eventDateBasis", e.target.value || null)} /></label>
					<label>재생 시간<input pattern="(?:[0-9]+:)?[0-9]+:[0-5][0-9]" value={draft.duration ?? ""} onChange={(e) => change("duration", e.target.value || null)} placeholder="2:34 (선택)" /></label>
					<label>표시 순서<input type="number" min={0} step={1} required value={draft.displayOrder} onChange={(e) => change("displayOrder", Number(e.target.value))} /><small>같은 날짜·분류 안에서 작은 숫자가 먼저 표시됩니다.</small></label>
					<label>채널 배지<input maxLength={30} value={draft.badge ?? ""} onChange={(e) => change("badge", e.target.value || null)} placeholder="SBS (선택)" /></label>
					<label>링크 확인일<input type="date" value={draft.verifiedOn ?? ""} onChange={(e) => change("verifiedOn", e.target.value || null)} /></label>
					<label className={styles.check}><input type="checkbox" checked={draft.leeFocused} onChange={(e) => change("leeFocused", e.target.checked)} />이소희 중심 영상</label>
					<label className={styles.check}><input type="checkbox" checked={draft.published} onChange={(e) => change("published", e.target.checked)} />사이트에 공개</label>
					<div className={styles.actions}><button type="submit">{busy ? "처리 중…" : "저장"}</button><button type="button" onClick={reset}>{editing ? "수정 취소" : "입력 초기화"}</button></div>
				</fieldset>
			</form>
			<section className={styles.panel} aria-label="등록된 영상">
				<h3>등록된 영상 {query.data ? `(${query.data.total})` : ""}</h3>
				{query.isLoading ? <p role="status">불러오는 중…</p> : query.isError ? <div role="alert"><p>영상 목록을 불러오지 못했습니다.</p><button onClick={() => { void query.refetch(); }}>다시 시도</button></div> : <>
					{query.data?.videos.length === 0 && <p>등록된 영상이 없습니다.</p>}
					{query.data?.videos.map((video) => <article key={video.id} className={styles.item}>
						<span>{video.published ? "공개" : "비공개"} · {VIDEO_CATEGORIES[video.category]}</span><h4><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">{video.title} ↗</a></h4>
						<p>{video.channelName} · {video.eventDate || "날짜 미확인"} · {video.eventLabel}</p>
						<div className={styles.actions}><button disabled={busy} onClick={() => edit(video)}>수정</button>
							<button disabled={busy} onClick={() => { void perform(async () => { await request(`/api/admin/videos/${video.id}`, "PUT", { ...video, published: !video.published }); if (editing && draft.id === video.id) change("published", !video.published); return video.published ? "영상을 숨겼습니다." : "영상을 공개했습니다."; }); }}>{video.published ? "숨기기" : "공개하기"}</button>
							<button disabled={busy} onClick={() => { if (!window.confirm(`“${video.title}” 영상을 삭제할까요?`)) return; void perform(async () => { await request(`/api/admin/videos/${video.id}`, "DELETE"); if (draft.id === video.id) reset(); if (query.data?.videos.length === 1 && page > 0) setPage(page - 1); return "영상을 삭제했습니다."; }); }}>삭제</button></div>
					</article>)}
					<nav className={styles.actions} aria-label="관리 영상 페이지"><button disabled={busy || page === 0} onClick={() => setPage(page - 1)}>이전</button><span>{page + 1} / {Math.max(1, query.data?.totalPages ?? 0)}</span><button disabled={busy || !query.data?.hasNext} onClick={() => setPage(page + 1)}>다음</button></nav>
				</>}
			</section>
		</div>
	</div>;
}
