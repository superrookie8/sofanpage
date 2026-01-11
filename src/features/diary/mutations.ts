// src/features/diary/mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { createDiary, updateDiary, deleteDiary } from "./api";
import type { CreateDiaryRequest } from "./types";

// 일지 생성 Mutation
export const useCreateDiaryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateDiaryRequest) => createDiary(data),
		onSuccess: () => {
			// 일지 목록 쿼리 무효화하여 자동 refetch
			queryClient.invalidateQueries({
				queryKey: queryKeys.diary.lists(),
			});
		},
	});
};

// 일지 수정 Mutation
export const useUpdateDiaryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			diaryId,
			data,
		}: {
			diaryId: string;
			data: Partial<CreateDiaryRequest>;
		}) => updateDiary(diaryId, data),
		onSuccess: (_, variables) => {
			// 해당 일지 상세 쿼리 무효화
			queryClient.invalidateQueries({
				queryKey: queryKeys.diary.detail(variables.diaryId),
			});
			// 일지 목록 쿼리도 무효화
			queryClient.invalidateQueries({
				queryKey: queryKeys.diary.lists(),
			});
		},
	});
};

// 일지 삭제 Mutation
export const useDeleteDiaryMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (diaryId: string) => deleteDiary(diaryId),
		onSuccess: (_, diaryId) => {
			// 해당 일지 상세 쿼리 제거
			queryClient.removeQueries({
				queryKey: queryKeys.diary.detail(diaryId),
			});
			// 일지 목록 쿼리 무효화
			queryClient.invalidateQueries({
				queryKey: queryKeys.diary.lists(),
			});
		},
	});
};
