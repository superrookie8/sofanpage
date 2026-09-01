import axios, { AxiosInstance } from "axios";
import { setupServerInterceptors } from "@/config/http/axiosInterceptors";
import { createServerAxiosConfig } from "./serverAxiosConfig";
import { reportSlackError } from "../alerts/slackErrorReporter";

/** 서버(BFF) 전용 axios 인스턴스. 클라이언트에서 import 하지 않는다. */
export async function createServerAxiosInstance(
	getToken: () => Promise<string | null>
): Promise<AxiosInstance> {
	let config: ReturnType<typeof createServerAxiosConfig>;
	try {
		config = createServerAxiosConfig();
	} catch (error) {
		await reportSlackError({
			source: "backend-config",
			error,
			route: "server-axios",
			routeType: "route",
		});
		throw error;
	}

	const instance = axios.create(config);
	setupServerInterceptors(instance, getToken, async (error) => {
		await reportSlackError({
			source: "backend-connect",
			error,
			route: "server-axios",
			method: error.config?.method,
			routeType: "route",
		});
	});
	return instance;
}
