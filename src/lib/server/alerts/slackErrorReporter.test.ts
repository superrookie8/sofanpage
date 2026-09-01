import { describe, expect, it, vi } from "vitest";
import {
	createSlackErrorReporter,
	slackErrorConfigFromEnvironment,
} from "./slackErrorReporter";

const enabledEnvironment = {
	SLACK_ERROR_ALERTS_ENABLED: "true",
	SLACK_ERROR_WEBHOOK_URL: "https://hooks.slack.com/services/test/team/value",
	SLACK_ERROR_ENVIRONMENT: "test",
};

function event(message = "backend connection failed") {
	return {
		source: "backend-connect" as const,
		error: new Error(message),
		route: "/api/events?token=must-not-leak",
		method: "GET",
		routeType: "route",
	};
}

describe("Slack server error reporter", () => {
	it("uses the shared bounded environment contract", () => {
		expect(slackErrorConfigFromEnvironment({})).toMatchObject({
			enabled: false,
			dedupeWindowMs: 300_000,
			maxPerMinute: 10,
			timeoutMs: 2_000,
		});
		expect(
			slackErrorConfigFromEnvironment({
				SLACK_ERROR_ALERTS_ENABLED: "true",
				SLACK_ERROR_DEDUPE_WINDOW_SECONDS: "60",
				SLACK_ERROR_MAX_PER_MINUTE: "5",
				SLACK_ERROR_TIMEOUT_MS: "750",
			})
		).toMatchObject({
			enabled: true,
			dedupeWindowMs: 60_000,
			maxPerMinute: 5,
			timeoutMs: 750,
		});
		expect(
			slackErrorConfigFromEnvironment({
				SLACK_ERROR_ALERTS_ENABLED: "TRUE",
				SLACK_ERROR_DEDUPE_WINDOW_SECONDS: "0",
				SLACK_ERROR_MAX_PER_MINUTE: "101",
				SLACK_ERROR_TIMEOUT_MS: "2e3",
			})
		).toMatchObject({
			enabled: false,
			dedupeWindowMs: 300_000,
			maxPerMinute: 10,
			timeoutMs: 2_000,
		});
	});

	it("is disabled by default and never calls the webhook", async () => {
		const fetchImplementation = vi.fn<typeof fetch>();
		const report = createSlackErrorReporter({
			environment: {},
			fetchImplementation,
		});

		await expect(report(event())).resolves.toBe("disabled");
		expect(fetchImplementation).not.toHaveBeenCalled();
	});

	it("sends only allowlisted fields and excludes the raw error message", async () => {
		const fetchImplementation = vi.fn<typeof fetch>(async () => new Response("ok"));
		const report = createSlackErrorReporter({
			environment: enabledEnvironment,
			fetchImplementation,
			now: () => Date.parse("2026-09-02T00:00:00.000Z"),
		});

		const rawMessage =
			"mongodb://db-user:arbitrary-password@db.internal/private token=raw-secret";
		await expect(report(event(rawMessage))).resolves.toBe("sent");

		const [, request] = fetchImplementation.mock.calls[0];
		const payload = JSON.parse(String(request?.body));
		expect(payload.text).toContain("GET /api/events");
		expect(payload.text).toContain("Error type: Error");
		expect(payload.text).not.toContain(rawMessage);
		expect(payload.text).not.toContain("mongodb");
		expect(payload.text).not.toContain("db-user");
		expect(payload.text).not.toContain("arbitrary-password");
		expect(payload.text).not.toContain("raw-secret");
		expect(payload.text).not.toContain("must-not-leak");
		expect(payload.text).not.toContain(enabledEnvironment.SLACK_ERROR_WEBHOOK_URL);
		expect(Object.keys(payload)).toEqual(["text"]);
	});

	it("deduplicates for five minutes and sends the suppression count later", async () => {
		let timestamp = 0;
		const fetchImplementation = vi.fn<typeof fetch>(async () => new Response("ok"));
		const report = createSlackErrorReporter({
			environment: enabledEnvironment,
			fetchImplementation,
			now: () => timestamp,
		});

		await expect(report(event())).resolves.toBe("sent");
		timestamp = 299_999;
		await expect(
			report(event("a completely different raw credential value"))
		).resolves.toBe("deduplicated");
		timestamp = 300_000;
		await expect(report(event("another raw message"))).resolves.toBe("sent");

		expect(fetchImplementation).toHaveBeenCalledTimes(2);
		const payload = JSON.parse(
			String(fetchImplementation.mock.calls[1][1]?.body)
		);
		expect(payload.text).toContain("Suppressed since previous alert: 1");
	});

	it("limits delivery to ten per minute and bounds the fingerprint cache", async () => {
		let timestamp = 0;
		const fetchImplementation = vi.fn<typeof fetch>(async () => new Response("ok"));
		const report = createSlackErrorReporter({
			environment: enabledEnvironment,
			fetchImplementation,
			now: () => timestamp,
		});

		for (let index = 0; index < 501; index += 1) {
			await report({
				...event("same raw message"),
				route: `/api/events/${index}`,
			});
		}
		expect(fetchImplementation).toHaveBeenCalledTimes(10);

		// The first fingerprint was evicted by the 500-entry bound, so it can send
		// once the one-minute global rate window has elapsed.
		timestamp = 60_000;
		await expect(
			report({ ...event("same raw message"), route: "/api/events/0" })
		).resolves.toBe("sent");
		expect(fetchImplementation).toHaveBeenCalledTimes(11);
	});

	it("never throws when Slack fails and logs no response or webhook data", async () => {
		const logger = { error: vi.fn() };
		const fetchImplementation = vi.fn<typeof fetch>(async () => {
			throw new Error("response body with private details");
		});
		const report = createSlackErrorReporter({
			environment: enabledEnvironment,
			fetchImplementation,
			logger,
		});

		await expect(report(event())).resolves.toBe("failed");
		expect(logger.error).toHaveBeenCalledWith("Slack error alert delivery failed");
		expect(JSON.stringify(logger.error.mock.calls)).not.toContain("private details");
		expect(JSON.stringify(logger.error.mock.calls)).not.toContain("hooks.slack.com");
	});

	it("aborts a stalled Slack request after two seconds without retrying", async () => {
		vi.useFakeTimers();
		const logger = { error: vi.fn() };
		const fetchImplementation = vi.fn<typeof fetch>((_url, request) =>
			new Promise((_resolve, reject) => {
				request?.signal?.addEventListener("abort", () =>
					reject(new DOMException("aborted", "AbortError"))
				);
			})
		);
		const report = createSlackErrorReporter({
			environment: enabledEnvironment,
			fetchImplementation,
			logger,
		});

		try {
			const pending = report(event());
			await vi.advanceTimersByTimeAsync(2_000);
			await expect(pending).resolves.toBe("failed");
			expect(fetchImplementation).toHaveBeenCalledOnce();
		} finally {
			vi.useRealTimers();
		}
	});
});
