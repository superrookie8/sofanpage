import axios, { AxiosInstance } from "axios";
import { setupServerInterceptors } from "@/config/http/axiosInterceptors";
import { createServerAxiosConfig } from "./serverAxiosConfig";

/** 서버(BFF) 전용 axios 인스턴스. 클라이언트에서 import 하지 않는다. */
export function createServerAxiosInstance(
	getToken: () => Promise<string | null>
): AxiosInstance {
	const instance = axios.create(createServerAxiosConfig());
	setupServerInterceptors(instance, getToken);
	return instance;
}
