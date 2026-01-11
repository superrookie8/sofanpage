// token 다룸, 인증정보 다룸, 내부 API 호출, BFF역할

// src/lib/server/http/axiosService.ts
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import axiosFactory from "@/lib/infra/http/axiosFactory";

class ServerAxiosService {
	private instance: AxiosInstance | null = null;

	private async getInstance(): Promise<AxiosInstance> {
		if (!this.instance) {
			this.instance = axiosFactory.createServerInstance(async () => {
				const session = await getServerSession(authOptions);
				return session?.accessToken || null;
			});
		}
		return this.instance;
	}

	async get<T = any>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		const instance = await this.getInstance();
		return instance.get<T>(url, config);
	}

	async post<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		const instance = await this.getInstance();
		return instance.post<T>(url, data, config);
	}

	async put<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		const instance = await this.getInstance();
		return instance.put<T>(url, data, config);
	}

	async patch<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		const instance = await this.getInstance();
		return instance.patch<T>(url, data, config);
	}

	async delete<T = any>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		const instance = await this.getInstance();
		return instance.delete<T>(url, config);
	}
}

export const serverAxiosService = new ServerAxiosService();
export default serverAxiosService;
