import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC = path.join(process.cwd(), "src");

function stripComments(source: string): string {
	return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((entry) => {
		const full = path.join(dir, entry);
		if (statSync(full).isDirectory()) return sourceFiles(full);
		return /\.(ts|tsx|js|jsx)$/.test(entry) ? [full] : [];
	});
}

/**
 * `NEXT_PUBLIC_` 접두사가 붙은 값은 Next.js가 클라이언트 번들에 문자열로 인라인한다.
 * 백엔드 origin이 거기 섞이면 브라우저가 BFF를 우회할 수 있는 주소를 얻는다.
 * 실제 번들 검사는 빌드가 필요하므로, 원인이 되는 소스 참조 자체를 막는다.
 */
describe("backend origin must not reach the client bundle", () => {
	const files = sourceFiles(SRC);

	it("finds source files to scan", () => {
		expect(files.length).toBeGreaterThan(50);
	});

	it("never reads NEXT_PUBLIC_BACKAPI_URL from process.env", () => {
		const offenders = files.filter((file) =>
			/process\.env\.NEXT_PUBLIC_BACKAPI_URL/.test(readFileSync(file, "utf-8"))
		);
		expect(offenders.map((file) => path.relative(SRC, file))).toEqual([]);
	});

	it("keeps the shared axios config free of a backend baseURL", () => {
		// 주석은 baseURL을 설명하므로 코드만 남기고 검사한다.
		const code = stripComments(
			readFileSync(path.join(SRC, "config/http/axiosConfig.ts"), "utf-8")
		);
		expect(code).not.toMatch(/baseURL\s*:/);
		expect(code).not.toMatch(/process\.env/);
	});

	it("keeps the client axios factory free of the server instance", () => {
		const code = stripComments(
			readFileSync(path.join(SRC, "lib/infra/http/axiosFactory.ts"), "utf-8")
		);
		expect(code).not.toMatch(/createServerInstance|serverAxiosConfig/);
	});
});
