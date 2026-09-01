const DEFAULT_DEDUPE_WINDOW_MS = 5 * 60 * 1000;
const DEFAULT_RATE_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_PER_RATE_WINDOW = 10;
const DEFAULT_MAX_FINGERPRINTS = 500;
const DEFAULT_TIMEOUT_MS = 2000;

const SLACK_WEBHOOK_HOSTS = new Set(["hooks.slack.com", "hooks.slack-gov.com"]);

export type SlackErrorCategory =
	| "admin_internal"
	| "backend_connection"
	| "backend_response"
	| "backend_timeout";

export type SlackErrorEvent = {
	operation: string;
	route: string;
	status: number;
	category: SlackErrorCategory;
};

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type SlackErrorNotifierOptions = {
	enabled: boolean;
	webhookUrl?: string;
	environment?: string;
	fetchImpl?: FetchLike;
	now?: () => number;
	dedupeWindowMs?: number;
	rateWindowMs?: number;
	maxPerRateWindow?: number;
	maxFingerprints?: number;
	timeoutMs?: number;
};

type SlackErrorEnvironment = Record<string, string | undefined>;

function boundedEnvironmentInteger(
	value: string | undefined,
	fallback: number,
	minimum: number,
	maximum: number
): number {
	const normalized = value?.trim() ?? "";
	if (!/^\d+$/.test(normalized)) return fallback;
	const parsed = Number(normalized);
	return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum
		? parsed
		: fallback;
}

export function slackErrorConfigFromEnv(environment: SlackErrorEnvironment) {
	return {
		enabled: environment.SLACK_ERROR_ALERTS_ENABLED === "true",
		webhookUrl: environment.SLACK_ERROR_WEBHOOK_URL,
		environment: environment.SLACK_ERROR_ENVIRONMENT ?? environment.NODE_ENV,
		dedupeWindowMs: boundedEnvironmentInteger(
			environment.SLACK_ERROR_DEDUPE_WINDOW_SECONDS,
			300,
			1,
			3600
		) * 1000,
		maxPerRateWindow: boundedEnvironmentInteger(
			environment.SLACK_ERROR_MAX_PER_MINUTE,
			10,
			1,
			100
		),
		timeoutMs: boundedEnvironmentInteger(
			environment.SLACK_ERROR_TIMEOUT_MS,
			2000,
			100,
			10_000
		),
	};
}

function slackWebhookUrl(value: string | undefined): string | null {
	if (!value) return null;
	try {
		const url = new URL(value);
		if (url.protocol !== "https:" || !SLACK_WEBHOOK_HOSTS.has(url.hostname)) return null;
		return url.toString();
	} catch {
		return null;
	}
}

function safeLabel(value: string, fallback: string): string {
	const normalized = value
		.trim()
		.replace(/[^a-zA-Z0-9._:/-]+/g, "_")
		.slice(0, 80);
	return normalized || fallback;
}

export function normalizeAlertRoute(value: string): string {
	let pathname: string;
	try {
		pathname = new URL(value, "https://admin.invalid").pathname;
	} catch {
		return "/unknown";
	}

	const normalized = pathname.split("/").map((segment) => {
		if (/^\d+$/.test(segment)) return ":id";
		if (/^[0-9a-f]{16,}$/i.test(segment)) return ":id";
		if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment)) return ":id";
		if (segment.length > 80) return ":value";
		return segment.replace(/[^a-zA-Z0-9._~-]/g, "_");
	}).join("/");

	return normalized.slice(0, 240) || "/unknown";
}

function boundedStatus(value: number): number {
	return Number.isInteger(value) && value >= 100 && value <= 599 ? value : 500;
}

export function createSlackErrorNotifier(options: SlackErrorNotifierOptions) {
	const webhookUrl = slackWebhookUrl(options.webhookUrl);
	const fetchImpl = options.fetchImpl ?? fetch;
	const now = options.now ?? Date.now;
	const dedupeWindowMs = options.dedupeWindowMs ?? DEFAULT_DEDUPE_WINDOW_MS;
	const rateWindowMs = options.rateWindowMs ?? DEFAULT_RATE_WINDOW_MS;
	const maxPerRateWindow = options.maxPerRateWindow ?? DEFAULT_MAX_PER_RATE_WINDOW;
	const maxFingerprints = options.maxFingerprints ?? DEFAULT_MAX_FINGERPRINTS;
	const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const environment = safeLabel(options.environment ?? "unknown", "unknown");
	const fingerprints = new Map<string, number>();
	let deliveries: number[] = [];

	return async function notifySlackError(event: SlackErrorEvent): Promise<void> {
		if (!options.enabled || !webhookUrl) return;

		const occurredAt = now();
		const operation = safeLabel(event.operation, "unknown");
		const route = normalizeAlertRoute(event.route);
		const status = boundedStatus(event.status);
		const fingerprint = JSON.stringify([
			"admin",
			environment,
			operation,
			route,
			event.category,
			status,
		]);

		fingerprints.forEach((seenAt, key) => {
			if (occurredAt - seenAt >= dedupeWindowMs) fingerprints.delete(key);
		});
		if (fingerprints.has(fingerprint)) return;
		while (fingerprints.size >= maxFingerprints) {
			const oldest = fingerprints.keys().next().value;
			if (typeof oldest !== "string") break;
			fingerprints.delete(oldest);
		}
		fingerprints.set(fingerprint, occurredAt);

		deliveries = deliveries.filter((sentAt) => occurredAt - sentAt < rateWindowMs);
		if (deliveries.length >= maxPerRateWindow) return;
		deliveries.push(occurredAt);

		// The payload is deliberately limited to one allowlisted text field. Never add
		// request bodies, headers, cookies, upstream response bodies, or raw errors.
		const payload = {
			text: [
				"[ERROR] supersohee/admin",
				`environment=${environment}`,
				`operation=${operation}`,
				`category=${event.category}`,
				`route=${route}`,
				`status=${status}`,
				`occurredAt=${new Date(occurredAt).toISOString()}`,
			].join("\n"),
		};
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), timeoutMs);
		try {
			await fetchImpl(webhookUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
				signal: controller.signal,
				redirect: "error",
			});
		} catch {
			// Alert delivery must never replace or delay the original API error contract.
		} finally {
			clearTimeout(timeout);
		}
	};
}
