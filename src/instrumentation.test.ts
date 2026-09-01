import { beforeEach, describe, expect, it, vi } from "vitest";

const { reportSlackError } = vi.hoisted(() => ({
	reportSlackError: vi.fn(async () => "sent"),
}));

vi.mock("@/lib/server/alerts/slackErrorReporter", () => ({ reportSlackError }));

import { onRequestError } from "./instrumentation";

describe("Next server instrumentation", () => {
	beforeEach(() => reportSlackError.mockClear());

	it("reports the route template without request headers or query values", async () => {
		await onRequestError(
			new Error("render failed"),
			{
				path: "/api/users/user-1?token=must-not-leak",
				method: "GET",
				headers: { authorization: "Bearer must-not-leak" },
			},
			{
				routerKind: "App Router",
				routePath: "/api/users/[userId]",
				routeType: "route",
				revalidateReason: undefined,
			}
		);

		expect(reportSlackError).toHaveBeenCalledWith({
			source: "next-unhandled",
			error: expect.any(Error),
			route: "/api/users/[userId]",
			method: "GET",
			routeType: "route",
		});
		expect(JSON.stringify(reportSlackError.mock.calls)).not.toContain("must-not-leak");
	});
});
