export const DEFAULT_AUTH_CALLBACK_URL = "/home";

export function getSafeCallbackUrl(
	value: string | null | undefined
): string {
	if (!value || !value.startsWith("/") || value.startsWith("//")) {
		return DEFAULT_AUTH_CALLBACK_URL;
	}

	try {
		const decodedValue = decodeURIComponent(value);
		if (decodedValue.startsWith("//") || decodedValue.includes("\\")) {
			return DEFAULT_AUTH_CALLBACK_URL;
		}

		const baseUrl = "https://supersohee.local";
		const parsedUrl = new URL(value, baseUrl);
		if (parsedUrl.origin !== baseUrl) {
			return DEFAULT_AUTH_CALLBACK_URL;
		}

		return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
	} catch {
		return DEFAULT_AUTH_CALLBACK_URL;
	}
}
