// src/lib/infra/http/axiosFactory.ts
import axios, { AxiosInstance } from "axios";
import { clientAxiosConfig } from "@/config/http/axiosConfig";
import { setupClientInterceptors } from "@/config/http/axiosInterceptors";

/**
 * 클라이언트 전용 factory. 서버 인스턴스는 백엔드 origin을 알아야 하므로
 * `@/lib/server/http/serverAxiosFactory`에 분리되어 있다. 두 경로를 한 모듈에
 * 두면 클라이언트 번들이 서버 설정까지 끌어와 백엔드 주소가 노출된다.
 */
export default class axiosFactory {
	static createClientInstance(): AxiosInstance {
		const instance = axios.create(clientAxiosConfig);
		setupClientInterceptors(instance);
		return instance;
	}

	// 기본 인스턴스 (기존 호환성 유지)
	static createInstance(): AxiosInstance {
		return this.createClientInstance();
	}
}
