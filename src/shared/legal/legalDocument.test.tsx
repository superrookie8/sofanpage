import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import LoginLegalNotice from "./loginLegalNotice";

beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => vi.unstubAllGlobals());

describe("public legal documents", () => {
	it("states the active personal-data processing and honest retention limits", () => {
		const html = renderToStaticMarkup(React.createElement(PrivacyPage));

		expect(html).toContain("2026년 9월 9일");
		expect(html).toContain("Google 이메일");
		expect(html).toContain("역할, 포인트, 레벨");
		expect(html).toContain("최대 유효기간은 24시간");
		expect(html).toContain("닉네임, 최고 점수, 순위");
		expect(html).toContain("프로필 사진");
		expect(html).toContain("단방향 해시로 저장된 비밀번호");
		expect(html).toContain("직관일지, 방명록과 일반 회원가입의 신규 접근 및 작성 기능은 현재 차단");
		expect(html).toContain("수동 처리");
		expect(html).toContain("Google Analytics는 이 방침이 적용되는 사이트 버전부터 비활성화");
		expect(html).toContain("Netlify");
		expect(html).toContain("Cloudtype");
		expect(html).toContain("MongoDB");
		expect(html).toContain("Cloudflare R2");
		expect(html).toContain("만 14세 미만");
		expect(html).not.toContain("mailto:");
		expect(html).not.toContain("탈퇴 즉시");
	});

	it("sets balanced service terms without claiming representation", () => {
		const html = renderToStaticMarkup(React.createElement(TermsPage));

		expect(html).toContain("2026년 9월 9일");
		expect(html).toContain("이소희 선수, 소속 구단, WKBL이나 그 밖의 리그·대회를 대리하지 않습니다");
		expect(html).toContain("닉네임, 최고 점수와 순위");
		expect(html).toContain("운영자의 고의 또는 중대한 과실");
		expect(html).toContain("대한민국 법률");
		expect(html).not.toContain("비공식");
		expect(html).not.toContain("mailto:");
	});

	it("links both documents near the login action without claiming consent", () => {
		const html = renderToStaticMarkup(React.createElement(LoginLegalNotice));

		expect(html).toContain('href="/terms"');
		expect(html).toContain('href="/privacy"');
		expect(html).toContain("로그인하면");
		expect(html).not.toContain("동의합니다");
	});
});
