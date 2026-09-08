"use client";
import { selectCompetitionFilter, competitionOf, type CompetitionSchedule, type ScheduleFilters } from "../competition";

export default function ScheduleFilterControls({ schedules, value, onChange }: {
	schedules: CompetitionSchedule[]; value: ScheduleFilters; onChange: (value: ScheduleFilters) => void;
}) {
	const competitions = new Map<string, string>();
	const editions = new Set<string>();
	const seasons = new Set<string>();
	for (const schedule of schedules) {
		const metadata = competitionOf(schedule);
		if (metadata.competitionKey) competitions.set(metadata.competitionKey, metadata.competitionName || metadata.competitionKey);
		if (!value.competitionKey || metadata.competitionKey === value.competitionKey) {
			if (metadata.editionLabel) editions.add(metadata.editionLabel);
			if (schedule.season) seasons.add(schedule.season);
		}
	}
	const fieldClass = "mt-1 block w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900";
	return <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label="일정 필터">
		<label className="text-sm">대회<select className={fieldClass} value={value.competitionKey || ""} onChange={(event) => onChange(selectCompetitionFilter(value, event.target.value))}><option value="">전체 대회</option>{Array.from(competitions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
		<label className="text-sm">개최 회차<select className={fieldClass} value={value.editionLabel || ""} onChange={(event) => onChange({ ...value, editionLabel: event.target.value })}><option value="">전체 회차</option>{Array.from(editions).sort().reverse().map((label) => <option key={label}>{label}</option>)}</select></label>
		<label className="text-sm">참가팀 유형<select className={fieldClass} value={value.teamType || ""} onChange={(event) => onChange({ ...value, teamType: event.target.value as ScheduleFilters["teamType"] })}><option value="">전체 팀</option><option value="club">구단</option><option value="national">국가대표</option></select></label>
		<label className="text-sm">시즌<select className={fieldClass} value={value.season || ""} onChange={(event) => onChange({ ...value, season: event.target.value })}><option value="">전체 시즌·시즌 없는 대회 포함</option>{Array.from(seasons).sort().reverse().map((season) => <option key={season}>{season}</option>)}</select></label>
	</div>;
}
