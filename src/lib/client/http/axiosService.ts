// src/lib/client/http/axiosService.ts
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axiosFactory from "@/lib/infra/http/axiosFactory";

class ClientAxiosService {
	private instance: AxiosInstance;

	constructor() {
		this.instance = axiosFactory.createClientInstance();
	}

	async get<T = any>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.instance.get<T>(url, config);
	}

	async post<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.instance.post<T>(url, data, config);
	}

	async put<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.instance.put<T>(url, data, config);
	}

	async patch<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.instance.patch<T>(url, data, config);
	}

	async delete<T = any>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.instance.delete<T>(url, config);
	}

	// 파일 업로드용
	async upload<T = any>(
		url: string,
		formData: FormData,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<T>> {
		return this.instance.post<T>(url, formData, {
			...config,
			headers: {
				...config?.headers,
				"Content-Type": "multipart/form-data",
			},
		});
	}
}

export const clientAxiosService = new ClientAxiosService();
export default clientAxiosService;
