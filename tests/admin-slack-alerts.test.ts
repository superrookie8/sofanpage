import assert from "node:assert/strict";
import test from "node:test";
import {
	createSlackErrorNotifier,
	normalizeAlertRoute,
	slackErrorConfigFromEnv,
} from "../src/lib/alerts/slack-core.ts";

const event = {
	operation: "adminBackendFetch",
	route: "/api/admin/events/507f1f77bcf86cd799439011?token=do-not-send",
	status: 502,
	category: "backend_connection" as const,
};

test("Slack environment settings are disabled and bounded by default", () => {
	assert.deepEqual(slackErrorConfigFromEnv({}), {
		enabled: false,
		webhookUrl: undefined,
		environment: undefined,
		dedupeWindowMs: 300_000,
		maxPerRateWindow: 10,
		timeoutMs: 2000,
	});
	assert.deepEqual(slackErrorConfigFromEnv({
		SLACK_ERROR_ALERTS_ENABLED: "true",
		SLACK_ERROR_WEBHOOK_URL: "https://hooks.slack.com/services/test/value/here",
		SLACK_ERROR_ENVIRONMENT: "staging",
		SLACK_ERROR_DEDUPE_WINDOW_SECONDS: "60",
		SLACK_ERROR_MAX_PER_MINUTE: "5",
		SLACK_ERROR_TIMEOUT_MS: "750",
	}), {
		enabled: true,
		webhookUrl: "https://hooks.slack.com/services/test/value/here",
		environment: "staging",
		dedupeWindowMs: 60_000,
		maxPerRateWindow: 5,
		timeoutMs: 750,
	});
	const invalid = slackErrorConfigFromEnv({
		SLACK_ERROR_ALERTS_ENABLED: "TRUE",
		SLACK_ERROR_DEDUPE_WINDOW_SECONDS: "0",
		SLACK_ERROR_MAX_PER_MINUTE: "101",
		SLACK_ERROR_TIMEOUT_MS: "2e3",
	});
	assert.equal(invalid.enabled, false);
	assert.equal(invalid.dedupeWindowMs, 300_000);
	assert.equal(invalid.maxPerRateWindow, 10);
	assert.equal(invalid.timeoutMs, 2000);
});

test("Slack error alerts default to a disabled no-op", async () => {
	let calls = 0;
	const notify = createSlackErrorNotifier({
		enabled: false,
		webhookUrl: "https://hooks.slack.com/services/test/value/here",
		fetchImpl: async () => {
			calls += 1;
			return new Response("ok");
		},
	});

	await notify(event);
	assert.equal(calls, 0);
});

test("Slack error alerts reject non-Slack webhook origins", async () => {
	let calls = 0;
	const notify = createSlackErrorNotifier({
		enabled: true,
		webhookUrl: "https://attacker.example/webhook",
		fetchImpl: async () => {
			calls += 1;
			return new Response("ok");
		},
	});

	await notify(event);
	assert.equal(calls, 0);
});

test("Slack payload uses only allowlisted, normalized metadata", async () => {
	let body = "";
	const notify = createSlackErrorNotifier({
		enabled: true,
		webhookUrl: "https://hooks.slack.com/services/test/value/here",
		environment: "production",
		now: () => Date.parse("2026-09-02T00:00:00.000Z"),
		fetchImpl: async (_input, init) => {
			body = String(init?.body);
			assert.equal(init?.redirect, "error");
			assert.deepEqual(init?.headers, { "Content-Type": "application/json" });
			return new Response("ok");
		},
	});

	await notify(event);
	const payload = JSON.parse(body) as Record<string, string>;
	assert.deepEqual(Object.keys(payload), ["text"]);
	assert.match(payload.text, /service|supersohee\/admin/);
	assert.match(payload.text, /route=\/api\/admin\/events\/:id/);
	assert.doesNotMatch(payload.text, /507f1f77bcf86cd799439011|token|do-not-send/);
	assert.doesNotMatch(body, /cookie|authorization|password/i);
	assert.equal(normalizeAlertRoute(event.route), "/api/admin/events/:id");
});

test("identical Slack errors are deduplicated for five minutes", async () => {
	let currentTime = 0;
	let calls = 0;
	const notify = createSlackErrorNotifier({
		enabled: true,
		webhookUrl: "https://hooks.slack.com/services/test/value/here",
		now: () => currentTime,
		fetchImpl: async () => {
			calls += 1;
			return new Response("ok");
		},
	});

	await notify(event);
	currentTime = 299_999;
	await notify(event);
	assert.equal(calls, 1);
	currentTime = 300_000;
	await notify(event);
	assert.equal(calls, 2);
});

test("Slack errors are capped at ten deliveries per minute", async () => {
	let calls = 0;
	const notify = createSlackErrorNotifier({
		enabled: true,
		webhookUrl: "https://hooks.slack.com/services/test/value/here",
		now: () => 1_000,
		fetchImpl: async () => {
			calls += 1;
			return new Response("ok");
		},
	});

	for (let index = 0; index < 11; index += 1) {
		await notify({ ...event, route: `/api/admin/events/item-${index}` });
	}
	assert.equal(calls, 10);
});

test("the fingerprint cache stays bounded at 500 entries", async () => {
	let calls = 0;
	const notify = createSlackErrorNotifier({
		enabled: true,
		webhookUrl: "https://hooks.slack.com/services/test/value/here",
		now: () => 1_000,
		maxPerRateWindow: 1_000,
		fetchImpl: async () => {
			calls += 1;
			return new Response("ok");
		},
	});

	for (let index = 0; index < 501; index += 1) {
		await notify({ ...event, route: `/api/admin/items/item-${index}` });
	}
	await notify({ ...event, route: "/api/admin/items/item-0" });
	assert.equal(calls, 502);
});

test("Slack delivery is attempted once and failures never escape", async () => {
	let calls = 0;
	const notify = createSlackErrorNotifier({
		enabled: true,
		webhookUrl: "https://hooks.slack.com/services/test/value/here",
		timeoutMs: 5,
		fetchImpl: async (_input, init) => {
			calls += 1;
			return await new Promise<Response>((_resolve, reject) => {
				init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
			});
		},
	});

	await assert.doesNotReject(notify(event));
	assert.equal(calls, 1);
});
