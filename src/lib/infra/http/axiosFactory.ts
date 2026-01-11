// src/lib/infra/http/axiosFactory.ts
import axios, { AxiosInstance } from "axios";
import { axiosConfig } from "@/config/http/axiosConfig";
import {
	setupClientInterceptors,
	setupServerInterceptors,
} from "@/config/http/axiosInterceptors";

export default class axiosFactory {
	// 클라이언트 사이드 인스턴스 생성
	static createClientInstance(): AxiosInstance {
		const instance = axios.create(axiosConfig);
		setupClientInterceptors(instance);
		return instance;
	}

	// 서버 사이드 인스턴스 생성
	static createServerInstance(
		getToken: () => Promise<string | null>
	): AxiosInstance {
		const instance = axios.create(axiosConfig);
		setupServerInterceptors(instance, getToken);
		return instance;
	}

	// 기본 인스턴스 (기존 호환성 유지)
	static createInstance(): AxiosInstance {
		return this.createClientInstance();
	}
}
