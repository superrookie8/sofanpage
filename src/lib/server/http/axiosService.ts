// token 다룸, 인증정보 다룸, 내부 API 호출, BFF역할

// src/lib/server/http/axiosService.ts
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axiosFactory from "@/lib/infra/http/axiosFactory";

class ServerAxiosService {
	private instance: AxiosInstance | null = null;

	private async getInstance(): Promise<AxiosInstance> {
		if (!this.instance) {
			// 공개 BFF는 인증정보를 전달하지 않는다. 보호 BFF는 NextRequest로
			// 검증한 backend token을 명시적으로 전달해야 한다.
			this.instance = axiosFactory.createServerInstance(async () => null);
		}
		return this.instance;
	}

	/** 보호 BFF가 암호화된 NextAuth cookie에서 복호화한 token만 지정한다. */
	private async getInstanceWithToken(
		token: string
	): Promise<AxiosInstance> {
		return axiosFactory.createServerInstance(async () => token);
	}

	async get<T = any>(
		url: string,
		config?: AxiosRequestConfig,
		token?: string
	): Promise<AxiosResponse<T>> {
		const instance = token
			? await this.getInstanceWithToken(token)
			: await this.getInstance();
		return instance.get<T>(url, config);
	}

	async post<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig,
		token?: string
	): Promise<AxiosResponse<T>> {
		const instance = token
			? await this.getInstanceWithToken(token)
			: await this.getInstance();
		return instance.post<T>(url, data, config);
	}

	async put<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig,
		token?: string
	): Promise<AxiosResponse<T>> {
		const instance = token
			? await this.getInstanceWithToken(token)
			: await this.getInstance();
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
		config?: AxiosRequestConfig,
		token?: string
	): Promise<AxiosResponse<T>> {
		const instance = token
			? await this.getInstanceWithToken(token)
			: await this.getInstance();
		return instance.delete<T>(url, config);
	}
}

export const serverAxiosService = new ServerAxiosService();
export default serverAxiosService;
