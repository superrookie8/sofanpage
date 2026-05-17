import "axios";

declare module "axios" {
	interface AxiosRequestConfig {
		/** true면 401 시 자동 signOut 하지 않음 (일지 중복 확인 등) */
		skipAuthRedirect?: boolean;
	}
}
