// src/config/http/axiosInterceptors.ts
import {
	AxiosInstance,
	InternalAxiosRequestConfig,
	AxiosError,
	AxiosResponse,
} from "axios";

// 클라이언트 사이드 인터셉터 설정
export const setupClientInterceptors = (instance: AxiosInstance) => {
	// Backend token은 HttpOnly NextAuth cookie 안에만 두며 브라우저에 노출하지 않는다.
	instance.interceptors.request.use(
		(config: InternalAxiosRequestConfig) => config,
		(error: AxiosError) => {
			return Promise.reject(error);
		},
	);

	// Response 인터셉터 - 에러 처리
	instance.interceptors.response.use(
		(response: AxiosResponse) => {
			return response;
		},
		async (error: AxiosError) => {
			const originalRequest = error.config as InternalAxiosRequestConfig & {
				_retry?: boolean;
			};

			// 401 에러 시 처리 (중복 일지 확인 등은 로그아웃하지 않음)
			if (
				error.response?.status === 401 &&
				!originalRequest._retry &&
				!originalRequest.skipAuthRedirect
			) {
				originalRequest._retry = true;

				if (typeof window !== "undefined") {
					const { signOut } = await import("next-auth/react");
					await signOut({ redirect: true, callbackUrl: "/login" });
				}
			}

			return Promise.reject(error);
		},
	);
};

// 서버 사이드 인터셉터 설정
export const setupServerInterceptors = (
	instance: AxiosInstance,
	getToken: () => Promise<string | null>,
) => {
	// Request 인터셉터 - 서버에서 토큰 가져오기
	instance.interceptors.request.use(
		async (config: InternalAxiosRequestConfig) => {
			const token = await getToken();
			if (token && config.headers) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		},
		(error: AxiosError) => {
			return Promise.reject(error);
		},
	);

	// Response 인터셉터
	instance.interceptors.response.use(
		(response: AxiosResponse) => {
			return response;
		},
		(error: AxiosError) => {
			return Promise.reject(error);
		},
	);
};
