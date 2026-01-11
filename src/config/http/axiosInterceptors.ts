// src/config/http/axiosInterceptors.ts
import {
	AxiosInstance,
	InternalAxiosRequestConfig,
	AxiosError,
	AxiosResponse,
} from "axios";

// 클라이언트 사이드 인터셉터 설정
export const setupClientInterceptors = (instance: AxiosInstance) => {
	// Request 인터셉터 - Next-Auth 세션에서 토큰 가져오기
	instance.interceptors.request.use(
		async (config: InternalAxiosRequestConfig) => {
			if (typeof window !== "undefined") {
				const { getSession } = await import("next-auth/react");
				const session = await getSession();

				if (session?.accessToken && config.headers) {
					config.headers.Authorization = `Bearer ${session.accessToken}`;
				}
			}
			return config;
		},
		(error: AxiosError) => {
			return Promise.reject(error);
		}
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

		// 401 에러 시 처리
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			if (typeof window !== "undefined") {
				const { getSession } = await import("next-auth/react");
				const session = await getSession();
				
				// 세션이 실제로 없을 때만 로그아웃 처리
				if (!session || !session.accessToken) {
					console.warn("401 error: No valid session, signing out");
					const { signOut } = await import("next-auth/react");
					await signOut({ redirect: true, callbackUrl: "/login" });
				} else {
					// 세션이 있는데 401이면 토큰 만료일 수 있으므로 그냥 에러만 반환
					console.warn("401 error but session exists, token may be expired");
				}
			}
		}

			return Promise.reject(error);
		}
	);
};

// 서버 사이드 인터셉터 설정
export const setupServerInterceptors = (
	instance: AxiosInstance,
	getToken: () => Promise<string | null>
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
		}
	);

	// Response 인터셉터
	instance.interceptors.response.use(
		(response: AxiosResponse) => {
			return response;
		},
		(error: AxiosError) => {
			return Promise.reject(error);
		}
	);
};
