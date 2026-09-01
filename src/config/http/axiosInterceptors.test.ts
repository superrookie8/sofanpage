import axios, { AxiosError } from "axios";
import { describe, expect, it, vi } from "vitest";
import { setupServerInterceptors } from "./axiosInterceptors";

describe("server Axios error ownership", () => {
	it("reports connection and timeout failures with no upstream response", async () => {
		const onNetworkError = vi.fn(async () => undefined);
		const instance = axios.create({
			adapter: async (config) => {
				throw new AxiosError("timeout", "ECONNABORTED", config);
			},
		});
		setupServerInterceptors(instance, async () => null, onNetworkError);

		await expect(instance.get("/api/events")).rejects.toMatchObject({
			code: "ECONNABORTED",
		});
		expect(onNetworkError).toHaveBeenCalledOnce();
	});

	it("does not report an HTTP 5xx returned by the backend", async () => {
		const onNetworkError = vi.fn(async () => undefined);
		const instance = axios.create({
			adapter: async (config) => {
				throw new AxiosError("unavailable", "ERR_BAD_RESPONSE", config, undefined, {
					data: { message: "unavailable" },
					status: 503,
					statusText: "Service Unavailable",
					headers: {},
					config,
				});
			},
		});
		setupServerInterceptors(instance, async () => null, onNetworkError);

		await expect(instance.get("/api/events")).rejects.toMatchObject({
			response: { status: 503 },
		});
		expect(onNetworkError).not.toHaveBeenCalled();
	});
});
