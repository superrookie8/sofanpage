import "server-only";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const CACHE_MAX = 500;
const DEFAULT_DEDUPE_WINDOW_SECONDS = 300;
const DEFAULT_MAX_PER_MINUTE = 10;
const DEFAULT_TIMEOUT_MS = 2_000;
const SERVICE = "supersohee-frontend";

export type SlackErrorSource =
	| "next-unhandled"
	| "backend-config"
	| "backend-connect"
	| "backend-parse";

export interface SlackErrorEvent {
	source: SlackErrorSource;
	error: unknown;
	route: string;
	method?: string;
	routeType?: string;
}

export type SlackErrorReportOutcome =
	| "sent"
	| "disabled"
	| "deduplicated"
	| "rate-limited"
	| "failed";

interface ReporterDependencies {
	environment?: Record<string, string | undefined>;
	fetchImplementation?: typeof fetch;
	now?: () => number;
	logger?: Pick<Console, "error">;
}

interface FingerprintState {
	lastSeenAt: number;
	lastSentAt: number;
	suppressedCount: number;
}

function boundedEnvironmentInteger(
	value: string | undefined,
	fallback: number,
	minimum: number,
	maximum: number
) {
	const normalized = value?.trim() || "";
	if (!/^\d+$/.test(normalized)) return fallback;
	const parsed = Number(normalized);
	return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum
		? parsed
		: fallback;
}

export function slackErrorConfigFromEnvironment(
	environment: Record<string, string | undefined>
) {
	return {
		enabled: environment.SLACK_ERROR_ALERTS_ENABLED === "true",
		webhookUrl: environment.SLACK_ERROR_WEBHOOK_URL,
		environment:
			environment.SLACK_ERROR_ENVIRONMENT || environment.NODE_ENV || "unknown",
		dedupeWindowMs:
			boundedEnvironmentInteger(
				environment.SLACK_ERROR_DEDUPE_WINDOW_SECONDS,
				DEFAULT_DEDUPE_WINDOW_SECONDS,
				1,
				3_600
			) * 1_000,
		maxPerMinute: boundedEnvironmentInteger(
			environment.SLACK_ERROR_MAX_PER_MINUTE,
			DEFAULT_MAX_PER_MINUTE,
			1,
			100
		),
		timeoutMs: boundedEnvironmentInteger(
			environment.SLACK_ERROR_TIMEOUT_MS,
			DEFAULT_TIMEOUT_MS,
			100,
			10_000
		),
	};
}

function safeText(value: string | undefined, fallback: string, maxLength: number) {
	const normalized = (value || fallback)
		.replace(/[\r\n\t]+/g, " ")
		.replace(/\s{2,}/g, " ")
		.trim();
	return normalized.slice(0, maxLength) || fallback;
}

function errorName(error: unknown) {
	if (error instanceof Error) {
		return safeLabel(error.name, "Error", 80);
	}
	return "Error";
}

function safeRoute(route: string) {
	return safeText(route.split(/[?#]/, 1)[0], "unknown", 180).replace(
		/[<&>]/g,
		"_"
	);
}

function safeLabel(value: string | undefined, fallback: string, maxLength = 80) {
	return safeText(value, fallback, maxLength).replace(/[^A-Za-z0-9._:/ -]/g, "_");
}

function fingerprintOf(value: string) {
	let first = 0x811c9dc5;
	let second = 0x9e3779b9;
	for (let index = 0; index < value.length; index += 1) {
		const code = value.charCodeAt(index);
		first = Math.imul(first ^ code, 0x01000193);
		second = Math.imul(second ^ code, 0x85ebca6b);
	}
	return [first, second]
		.map((part) => (part >>> 0).toString(16).padStart(8, "0"))
		.join("");
}

function resolveWebhookUrl(enabled: boolean, value: string | undefined) {
	if (!enabled) return null;

	const configured = value?.trim();
	if (!configured) return null;

	try {
		const url = new URL(configured);
		const supportedHost =
			url.hostname === "hooks.slack.com" || url.hostname === "hooks.slack-gov.com";
		if (
			url.protocol !== "https:" ||
			!supportedHost ||
			!url.pathname.startsWith("/services/") ||
			url.username ||
			url.password
		) {
			return null;
		}
		return url.toString();
	} catch {
		return null;
	}
}

/**
 * Server-only Slack reporter. The public API accepts an allowlisted event shape only;
 * request headers, cookies, bodies, query strings, and Axios configs are never serialized.
 */
export function createSlackErrorReporter({
	environment = process.env,
	fetchImplementation = fetch,
	now = Date.now,
	logger = console,
}: ReporterDependencies = {}) {
	const config = slackErrorConfigFromEnvironment(environment);
	const fingerprints = new Map<string, FingerprintState>();
	let sentAt: number[] = [];

	return async function reportSlackError(
		event: SlackErrorEvent
	): Promise<SlackErrorReportOutcome> {
		try {
			const webhookUrl = resolveWebhookUrl(config.enabled, config.webhookUrl);
			if (!webhookUrl) return "disabled";

			const timestamp = now();
			const route = safeRoute(event.route);
			const method = safeLabel(event.method, "UNKNOWN", 16).toUpperCase();
			const routeType = safeLabel(event.routeType, "server", 40);
			const service = SERVICE;
			const deploymentEnvironment = safeLabel(config.environment, "unknown", 80);
			const name = errorName(event.error);
			const fingerprint = fingerprintOf(
				[
					service,
					deploymentEnvironment,
					event.source,
					route,
					method,
					routeType,
					name,
				].join("|")
			);

			for (const [key, state] of fingerprints) {
				if (timestamp - state.lastSeenAt >= config.dedupeWindowMs * 2) {
					fingerprints.delete(key);
				}
			}

			const previous = fingerprints.get(fingerprint);
			if (previous && timestamp - previous.lastSentAt < config.dedupeWindowMs) {
				previous.lastSeenAt = timestamp;
				previous.suppressedCount += 1;
				return "deduplicated";
			}

			sentAt = sentAt.filter(
				(sentTimestamp) => timestamp - sentTimestamp < RATE_LIMIT_WINDOW_MS
			);
			if (sentAt.length >= config.maxPerMinute) {
				fingerprints.delete(fingerprint);
				fingerprints.set(fingerprint, {
					lastSeenAt: timestamp,
					lastSentAt: timestamp,
					suppressedCount: (previous?.suppressedCount || 0) + 1,
				});
				while (fingerprints.size > CACHE_MAX) {
					const oldest = fingerprints.keys().next().value as string | undefined;
					if (!oldest) break;
					fingerprints.delete(oldest);
				}
				return "rate-limited";
			}

			fingerprints.delete(fingerprint);
			fingerprints.set(fingerprint, {
				lastSeenAt: timestamp,
				lastSentAt: timestamp,
				suppressedCount: 0,
			});
			while (fingerprints.size > CACHE_MAX) {
				const oldest = fingerprints.keys().next().value as string | undefined;
				if (!oldest) break;
				fingerprints.delete(oldest);
			}
			sentAt.push(timestamp);

			const suppressedCount = previous?.suppressedCount || 0;
			const lines = [
				":red_circle: Supersohee server error",
				`Service: ${service}`,
				`Environment: ${deploymentEnvironment}`,
				`Source: ${event.source}`,
				`Request: ${method} ${route}`,
				`Route type: ${routeType}`,
				`Error type: ${name}`,
				`Fingerprint: ${fingerprint}`,
				...(suppressedCount > 0
					? [`Suppressed since previous alert: ${suppressedCount}`]
					: []),
				`Time: ${new Date(timestamp).toISOString()}`,
			];

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
			try {
				const response = await fetchImplementation(webhookUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text: lines.join("\n") }),
					signal: controller.signal,
				});
				if (!response.ok) {
					logger.error("Slack error alert delivery failed");
					return "failed";
				}
				return "sent";
			} catch {
				logger.error("Slack error alert delivery failed");
				return "failed";
			} finally {
				clearTimeout(timeout);
			}
		} catch {
			logger.error("Slack error alert reporter failed");
			return "failed";
		}
	};
}

export const reportSlackError = createSlackErrorReporter();
