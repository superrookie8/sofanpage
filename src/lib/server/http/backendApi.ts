/**
 * 서버 전용 키만 허용한다. `NEXT_PUBLIC_` 접두사가 붙은 값은 Next.js가 클라이언트
 * 번들에 인라인하므로 백엔드 origin이 브라우저에 노출된다.
 */
const BACKEND_URL_KEYS = ["BACKEND_API_URL", "BACKAPI_URL"] as const;

export class BackendApiConfigurationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BackendApiConfigurationError";
	}
}

export function resolveBackendApiUrl(
	environment: Record<string, string | undefined> = process.env
) {
	const selectedKey = BACKEND_URL_KEYS.find((key) => environment[key]?.trim());
	if (!selectedKey) {
		throw new BackendApiConfigurationError(
			"Missing server backend API configuration"
		);
	}

	let backendUrl: URL;
	try {
		backendUrl = new URL(environment[selectedKey]!.trim());
	} catch {
		throw new BackendApiConfigurationError(
			`Invalid backend API configuration: ${selectedKey}`
		);
	}

	if (
		!(backendUrl.protocol === "http:" || backendUrl.protocol === "https:") ||
		backendUrl.username ||
		backendUrl.password
	) {
		throw new BackendApiConfigurationError(
			`Unsafe backend API configuration: ${selectedKey}`
		);
	}

	return backendUrl.toString().replace(/\/$/, "");
}

interface ProxyBackendRequestOptions {
	path: string;
	requestUrl?: string | URL;
	environment?: Record<string, string | undefined>;
	fetchImplementation?: typeof fetch;
}

function jsonError(message: string, status: number) {
	return new Response(JSON.stringify({ message }), {
		status,
		headers: {
			"Cache-Control": "no-store",
			"Content-Type": "application/json; charset=utf-8",
		},
	});
}

/** Server BFF 전용. Browser에 backend origin을 노출하지 않고 응답을 그대로 전달한다. */
export async function proxyBackendRequest({
	path,
	requestUrl,
	environment = process.env,
	fetchImplementation = fetch,
}: ProxyBackendRequestOptions) {
	if (!path.startsWith("/") || path.startsWith("//")) {
		return jsonError("Invalid backend request path", 500);
	}

	let backendUrl: URL;
	try {
		backendUrl = new URL(path, `${resolveBackendApiUrl(environment)}/`);
	} catch (error) {
		if (error instanceof BackendApiConfigurationError) {
			return jsonError("Backend API is not configured", 500);
		}
		throw error;
	}

	if (requestUrl) {
		backendUrl.search = new URL(requestUrl).search;
	}

	try {
		const upstreamResponse = await fetchImplementation(backendUrl, {
			method: "GET",
			headers: { Accept: "application/json" },
			cache: "no-store",
		});
		const responseBody = await upstreamResponse.arrayBuffer();

		return new Response(responseBody.byteLength > 0 ? responseBody : null, {
			status: upstreamResponse.status,
			headers: {
				"Cache-Control": "no-store",
				"Content-Type":
					upstreamResponse.headers.get("content-type") ||
					"application/json; charset=utf-8",
			},
		});
	} catch {
		return jsonError("Backend API is unavailable", 502);
	}
}
