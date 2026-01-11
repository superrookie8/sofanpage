// src/lib/react-query/queryClient.ts
"use client";

import { QueryClient } from "@tanstack/react-query";

// QueryClient 인스턴스 생성
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// 기본적으로 staleTime을 5분으로 설정 (5분 동안은 캐시된 데이터 사용)
			staleTime: 1000 * 60 * 5,
			// 에러 발생 시 자동 재시도 1회
			retry: 1,
			// 윈도우 포커스 시 자동 refetch 비활성화 (필요시 활성화)
			refetchOnWindowFocus: false,
		},
		mutations: {
			// mutation 실패 시 자동 재시도 비활성화
			retry: false,
		},
	},
});
