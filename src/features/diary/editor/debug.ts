/** 수정 페이지·좌석 복원 디버깅용 (배포 확인 후 제거 가능) */
const TAG = "[DiaryEdit]";

export const diaryEditLog = (...args: unknown[]) => {
	console.log(TAG, ...args);
};

export const diaryEditWarn = (...args: unknown[]) => {
	console.warn(TAG, ...args);
};

export const diaryEditError = (label: string, error: unknown) => {
	console.error(TAG, label, error);
};
