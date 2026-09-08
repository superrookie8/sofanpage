"use client";
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { currentSeason, locations, OPPONENT_TEAMS, TIME_PRESETS, type GameSchedule } from "@/lib/admin/schedule";
import { competitionOf, competitionLabel, keyAfterCompetitionNameEdit, COMPETITION_PRESETS, scheduleFilterKey, scheduleFilterParams, matchesScheduleFilters, venueTypeLabel, type ScheduleFilters } from "@/features/games/competition";
import { createScheduleDraft } from "@/lib/admin/scheduleDraft";
import ScheduleFilterControls from "@/features/games/components/scheduleFilters";

type Notice = { tone: "error" | "success"; text: string };
async function responseJson(response: Response) {
	const data = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(data.message || data.error || "일정을 처리하지 못했습니다.");
	return data;
}

export default function AdminSchedule() {
	const client = useQueryClient();
	const [filters, setFilters] = useState<ScheduleFilters>({});
	const [venueFilter, setVenueFilter] = useState("");
	const [form, setForm] = useState<GameSchedule>(() => createScheduleDraft());
	const [saving, setSaving] = useState(false);
	const [notice, setNotice] = useState<Notice | null>(null);
	const [customKey, setCustomKey] = useState(false);
	const formHeading = useRef<HTMLHeadingElement>(null);
	const all = useQuery<GameSchedule[]>({ queryKey: ["admin", "schedules", "options"], queryFn: async () => responseJson(await fetch("/api/admin/getschedule", { cache: "no-store" })) });
	const list = useQuery<GameSchedule[]>({ queryKey: ["admin", "schedules", "list", scheduleFilterKey(filters)], queryFn: async () => responseJson(await fetch(`/api/admin/getschedule?${scheduleFilterParams(filters)}`, { cache: "no-store" })) });
	const schedules = useMemo(() => (list.data ?? []).filter((game) => matchesScheduleFilters(game, filters) && (!venueFilter || competitionOf(game).venueType === venueFilter)).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)), [list.data, filters, venueFilter]);
	const update = <K extends keyof GameSchedule>(key: K, value: GameSchedule[K]) => setForm((current) => ({ ...current, [key]: value }));
	const refresh = async () => { await client.invalidateQueries({ queryKey: ["admin", "schedules"] }); await client.invalidateQueries({ queryKey: ["games"] }); };
	const reset = () => { setForm(createScheduleDraft()); setCustomKey(false); };
	const startNew = () => {
		setForm(createScheduleDraft(form)); setCustomKey(Boolean(form._id || customKey) && form.competitionKey !== "legacy-special");
		setNotice({ tone: "success", text: "새 경기 작성 모드입니다. 대회 정보를 확인한 뒤 날짜·시간·상대팀을 입력하세요." });
		requestAnimationFrame(() => { formHeading.current?.focus(); formHeading.current?.scrollIntoView({ block: "start", behavior: "smooth" }); });
	};
	const edit = (game: GameSchedule) => {
		const metadata = competitionOf(game);
		const oldVenue = game.isHome ? game.extraHome || "부산 사직실내체육관" : game.opponent;
		setForm({ ...game, season: game.season || "", ...metadata, venueName: game.venueName ?? (!game.competitionKey ? locations[oldVenue]?.name ?? "" : ""), stadiumId: game.stadiumId ?? "", stage: game.stage ?? "" });
		setCustomKey(true); setNotice(null);
	};
	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (saving) return;
		setSaving(true); setNotice(null);
		try {
			await responseJson(await fetch("/api/admin/postschedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, isHome: form.venueType === "home" }) }));
			setNotice({ tone: "success", text: form._id ? "경기 일정을 수정했습니다." : "경기 일정을 등록했습니다." });
			reset(); await refresh();
		} catch (error) { setNotice({ tone: "error", text: error instanceof Error ? error.message : "일정을 저장하지 못했습니다." }); }
		finally { setSaving(false); }
	};
	const remove = async (game: GameSchedule) => {
		if (!window.confirm(`${game.date} ${game.opponent} 경기를 삭제할까요?`)) return;
		try {
			await responseJson(await fetch("/api/admin/deleteschedule", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ _id: game._id }) }));
			if (form._id === game._id) reset(); await refresh(); setNotice({ tone: "success", text: "경기를 삭제했습니다." });
		} catch (error) { setNotice({ tone: "error", text: error instanceof Error ? error.message : "삭제하지 못했습니다." }); }
	};
	const unknownSpecial = form.competitionKey === "legacy-special" && (!form.teamType || !form.ourTeamName);
	const field = "mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2";
	return <div>
		<div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">경기 일정 관리</h2><button type="button" disabled={saving} onClick={startNew} className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white">새 경기 등록</button></div>
		<p className="mb-5 text-sm text-slate-600">구단·국가대표의 모든 대회를 관리합니다. 경기 날짜와 시간은 한국시간(Asia/Seoul)으로 입력하세요.</p>
		<ScheduleFilterControls schedules={all.data ?? []} value={filters} onChange={setFilters} />
		{(all.isError || list.isError) && <p role="alert" className="mb-4 text-red-700">일정을 불러오지 못했습니다. <button onClick={() => { all.refetch(); list.refetch(); }}>다시 시도</button></p>}
		{notice && <p role={notice.tone === "error" ? "alert" : "status"} className="mb-4 rounded border p-3">{notice.text}</p>}
		<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
			<form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-5">
				<h3 ref={formHeading} tabIndex={-1} className="scroll-mt-24 text-lg font-bold">{form._id ? "기존 경기 수정" : "새 경기 작성"}</h3><p className="text-sm text-slate-600">{form._id ? "선택한 경기의 내용을 수정합니다. 새 경기를 추가하려면 상단의 새 경기 등록을 누르세요." : "아래 정보를 입력하고 새 경기 저장을 누르면 일정에 추가됩니다."}</p>
				{unknownSpecial && <div className="rounded border p-3 text-sm"><p>미분류 특별경기입니다. 기존 날짜·상대팀을 수정해도 대회를 임의로 분류하지 않습니다. 대회 정보를 지정하려면 빠른 선택 또는 직접 분류를 선택하세요.</p><button type="button" className="mt-2 underline" onClick={() => { setCustomKey(false); setForm((current) => ({ ...current, competitionKey: "", competitionName: "", teamType: "club", ourTeamName: "" })); }}>대회 직접 분류</button></div>}
				<label className="block text-sm">대회 빠른 선택<select className={field} value="" onChange={(event) => {
					const preset = COMPETITION_PRESETS.find((entry) => entry.key === event.target.value); if (!preset) return;
					setForm((current) => ({ ...current, competitionKey: preset.key, competitionName: preset.name, competitionKind: preset.kind, teamType: preset.teamType, ourTeamName: preset.teamType === "national" ? "대한민국" : "BNK 썸", editionLabel: current._id ? current.editionLabel : preset.kind === "league" ? currentSeason() : String(new Date().getFullYear()), season: current._id ? current.season : preset.kind === "league" ? currentSeason() : "" })); setCustomKey(true);
				}}><option value="">직접 입력 또는 빠른 선택</option>{COMPETITION_PRESETS.map((entry) => <option key={entry.key} value={entry.key}>{entry.name}</option>)}</select></label>
				<label className="block text-sm">대회 이름<input disabled={Boolean(unknownSpecial)} className={field} required maxLength={100} value={form.competitionName || ""} onChange={(event) => { const name = event.target.value; setForm((current) => ({ ...current, competitionName: name, competitionKey: keyAfterCompetitionNameEdit(name, current.competitionKey, !customKey) })); }} placeholder="예: 월드컵, 아시안게임, 초청대회" /></label>
				<details className="rounded border p-3"><summary className="cursor-pointer text-sm">고급 설정: 대회 식별자</summary><label className="block text-sm">대회 식별자<input disabled={Boolean(unknownSpecial)} className={field} required maxLength={100} value={form.competitionKey || ""} onChange={(event) => { setCustomKey(true); update("competitionKey", event.target.value); }} /><span className="text-xs text-slate-500">같은 대회는 회차가 달라도 같은 식별자를 사용하세요.</span></label></details>
				<label className="block text-sm">개최 회차<input disabled={Boolean(unknownSpecial)} className={field} required maxLength={100} value={form.editionLabel || ""} onChange={(event) => update("editionLabel", event.target.value)} placeholder="예: 2026, 2026-2027, 제3회 초청전" /><span className="text-xs text-slate-500">개최가 연기되어도 기존 회차를 그대로 입력할 수 있습니다.</span></label>
				<label className="block text-sm">대회 유형<select disabled={Boolean(unknownSpecial)} className={field} value={form.competitionKind || ""} onChange={(event) => update("competitionKind", (event.target.value || null) as GameSchedule["competitionKind"])}><option value="">미지정</option><option value="league">리그</option><option value="tournament">대회</option><option value="friendly">친선경기</option><option value="other">기타</option></select></label>
				<div className="grid gap-3 sm:grid-cols-2">
					<label className="text-sm">참가팀 유형<select disabled={Boolean(unknownSpecial)} className={field} required value={form.teamType || ""} onChange={(event) => update("teamType", event.target.value as GameSchedule["teamType"])}><option value="">미분류</option><option value="club">구단</option><option value="national">국가대표</option></select></label>
					<label className="text-sm">우리 팀<input disabled={Boolean(unknownSpecial)} className={field} required maxLength={100} value={form.ourTeamName || ""} onChange={(event) => update("ourTeamName", event.target.value)} placeholder="BNK 썸 / 대한민국" /></label>
				</div>
				<label className="block text-sm">상대 팀<input className={field} list="admin-opponent-options" required maxLength={100} value={form.opponent} onChange={(event) => update("opponent", event.target.value)} placeholder="상대 팀 선택 또는 직접 입력" /><datalist id="admin-opponent-options">{OPPONENT_TEAMS.map((team) => <option key={team} value={team} />)}</datalist></label>
				<div className="grid gap-3 sm:grid-cols-2">
					<label className="text-sm">경기 날짜 (한국시간)<input className={field} type="date" required value={form.date} onChange={(event) => update("date", event.target.value)} /></label>
					<label className="text-sm">경기 시간 (한국시간)<input className={field} type="time" list="admin-time-options" required value={form.time} onChange={(event) => update("time", event.target.value)} /><datalist id="admin-time-options">{TIME_PRESETS.map((time) => <option key={time} value={time} />)}</datalist></label>
				</div>
				<label className="block text-sm">경기 장소 구분<select disabled={Boolean(unknownSpecial)} className={field} value={form.venueType || "away"} onChange={(event) => setForm((current) => ({ ...current, venueType: event.target.value as GameSchedule["venueType"], isHome: event.target.value === "home" }))}><option value="home">홈</option><option value="away">원정</option><option value="neutral">중립</option></select></label>
				<label className="block text-sm">경기장 이름 (선택)<input disabled={Boolean(unknownSpecial)} className={field} maxLength={200} value={form.venueName || ""} onChange={(event) => update("venueName", event.target.value)} placeholder="미입력 시 경기장 미정" /></label>
				{form.stadiumId && <button type="button" disabled={Boolean(unknownSpecial)} className="text-sm underline" onClick={() => update("stadiumId", null)}>기존 경기장 연결 해제</button>}
				<label className="block text-sm">경기 단계 (선택)<input disabled={Boolean(unknownSpecial)} className={field} maxLength={100} value={form.stage || ""} onChange={(event) => update("stage", event.target.value)} placeholder="예선, 조별리그, 준결승, 결승" /></label>
				<label className="block text-sm">시즌 (선택)<input className={field} maxLength={100} value={form.season || ""} onChange={(event) => update("season", event.target.value)} placeholder="정규리그의 기존 시즌 값" /><span className="text-xs text-slate-500">대회 회차와 별개입니다. 국가대표·컵대회는 비워둘 수 있습니다.</span></label>
				<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(form.specialGame)} onChange={(event) => update("specialGame", event.target.checked)} />특별 경기 (기존 올스타전 등, 대회 분류와 별개)</label>
				<div className="flex gap-3"><button disabled={saving} className="rounded bg-slate-900 px-4 py-2 text-white">{saving ? "저장 중…" : form._id ? "변경사항 저장" : "새 경기 저장"}</button>{form._id && <button type="button" onClick={reset}>수정 취소</button>}</div>
			</form>
			<section>
				<label className="mb-3 block text-sm">경기 장소 필터<select className={field} value={venueFilter} onChange={(event) => setVenueFilter(event.target.value)}><option value="">전체</option><option value="home">홈</option><option value="away">원정</option><option value="neutral">중립</option></select></label>
				{list.isLoading ? <p role="status">일정을 불러오고 있어요.</p> : schedules.length === 0 ? <div className="rounded border p-5"><p>선택한 조건의 경기가 없습니다.</p><button type="button" disabled={saving} onClick={startNew} className="mt-3 rounded border border-slate-400 px-4 py-2 font-semibold">새 경기 등록</button></div> : <ul className="space-y-3">{schedules.map((game) => <li key={game._id} className="rounded-xl border bg-white p-4">
					<p className="text-xs text-slate-600">{competitionLabel(game)}</p><h3 className="mt-1 font-bold">{competitionOf(game).ourTeamName} vs {game.opponent}</h3>
					<p className="mt-1 text-sm">{game.date} {game.time} (한국시간) · {venueTypeLabel(game)} · {game.venueName || "경기장 미정"}</p>
					<div className="mt-3 flex gap-4 text-sm"><button onClick={() => edit(game)}>수정</button><button onClick={() => remove(game)} className="text-red-700">삭제</button></div>
				</li>)}</ul>}
			</section>
		</div>
	</div>;
}
