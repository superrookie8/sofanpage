import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * tsconfig의 `@/*` 별칭을 테스트에도 적용한다. 이 별칭을 쓰는 모듈은
 * 설정이 없으면 import 자체가 실패해 테스트를 붙일 수 없었다.
 */
export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			// Next replaces this marker during server builds. Vitest needs the same
			// empty server-side target so it can exercise server-only modules.
			"server-only": fileURLToPath(
				new URL(
					"./node_modules/next/dist/compiled/server-only/empty.js",
					import.meta.url
				)
			),
		},
	},
});
