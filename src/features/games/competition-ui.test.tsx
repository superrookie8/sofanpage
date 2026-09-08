import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import ScheduleFilterControls from "./components/scheduleFilters";
import GameCard from "@/shared/ui/primitives/gameCard";
import Calendar from "./components/calender";
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(), useRouter: () => ({ replace: vi.fn() }) }));
import AdminSchedule from "@/app/admin/schedule/page";

afterEach(() => vi.unstubAllGlobals());
it("renders open competition/opponent input, edition, Korean time and all three venue types", () => {
	vi.stubGlobal("React", React);
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
	const html = renderToStaticMarkup(React.createElement(QueryClientProvider, { client }, React.createElement(AdminSchedule)));
	expect(html).toContain("새 경기 등록");
	expect(html).toContain("새 경기 작성");
	expect(html).toContain("새 경기 저장");
	expect(html).not.toContain("변경사항 저장");
	expect(html).toContain("개최 회차");
	expect(html).toContain("한국시간");
	expect(html).toContain('list="admin-opponent-options"');
	expect(html).toContain('<option value="neutral">중립</option>');
	expect(html).toContain("아시안게임"); expect(html).toContain("올림픽");
	expect(html).toContain("전체 시즌·시즌 없는 대회 포함");
	expect(html).toContain("고급 설정: 대회 식별자");
	client.clear();
});
it("renders unknown-season national competitions in filter choices without auto-selecting a WKBL season", () => {
	vi.stubGlobal("React", React);
	const html = renderToStaticMarkup(React.createElement(ScheduleFilterControls, { schedules: [{ competitionKey: "olympics", competitionName: "올림픽", editionLabel: "2024 연기대회", teamType: "national", season: null }], value: {}, onChange: () => {} }));
	expect(html).toContain('value="olympics"'); expect(html).toContain("2024 연기대회");
	expect(html).toContain('value="" selected=""');
});
it("neutral cards show team/competition labels and a neutral badge, not an away label", () => {
	vi.stubGlobal("React", React);
	const html = renderToStaticMarkup(React.createElement(GameCard, { dateLabel: "09.10", weekdayLabel: "목", opponent: "대한민국 vs 호주", detail: "19:00", isHome: false, venueLabel: "중립", competition: "월드컵 · 2026 · 조별리그" }));
	expect(html).toContain("대한민국 vs 호주"); expect(html).toContain("월드컵"); expect(html).toContain("중립"); expect(html).not.toContain("원정");
});

it("the calendar legend distinguishes neutral games from both home and away", () => {
	vi.stubGlobal("React", React);
	const client = new QueryClient();
	const html = renderToStaticMarkup(React.createElement(QueryClientProvider, { client }, React.createElement(Calendar, { syncUrl: false, onLocationSelect: () => {} })));
	expect(html).toContain("홈 경기"); expect(html).toContain("원정 경기"); expect(html).toContain("중립 경기");
	client.clear();
});
