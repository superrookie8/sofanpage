// src/lib/react-query/queryKeys.ts

// Query Key 팩토리 함수들
export const queryKeys = {
	// Diary 관련
	diary: {
		all: ["diary"] as const,
		lists: () => [...queryKeys.diary.all, "list"] as const,
		list: (filters?: Record<string, any>) =>
			[...queryKeys.diary.lists(), filters] as const,
		details: () => [...queryKeys.diary.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.diary.details(), id] as const,
		userDiaries: (nickname: string) =>
			[...queryKeys.diary.all, "user", nickname] as const,
		stats: (nickname: string) =>
			[...queryKeys.diary.all, "stats", nickname] as const,
	},

	// Games 관련
	games: {
		all: ["games"] as const,
		lists: () => [...queryKeys.games.all, "list"] as const,
		list: (filters?: Record<string, any>) =>
			[...queryKeys.games.lists(), filters] as const,
		details: () => [...queryKeys.games.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.games.details(), id] as const,
		schedule: () => [...queryKeys.games.all, "schedule"] as const,
		schedulesByDateRange: (start: string, end: string) =>
			[...queryKeys.games.all, "schedules", start, end] as const,
	},

	// News 관련
	news: {
		all: ["news"] as const,
		latest: () => [...queryKeys.news.all, "latest"] as const,
		jumpball: () => [...queryKeys.news.all, "jumpball"] as const,
		rookie: () => [...queryKeys.news.all, "rookie"] as const,
	},

	// Events 관련
	events: {
		all: ["events"] as const,
		lists: () => [...queryKeys.events.all, "list"] as const,
		list: (filters?: Record<string, any>) =>
			[...queryKeys.events.lists(), filters] as const,
		details: () => [...queryKeys.events.all, "detail"] as const,
		detail: (id: string) => [...queryKeys.events.details(), id] as const,
		photos: (eventId: string) =>
			[...queryKeys.events.details(), eventId, "photos"] as const,
	},

	// User 관련
	user: {
		all: ["user"] as const,
		profile: () => [...queryKeys.user.all, "profile"] as const,
		info: () => [...queryKeys.user.all, "info"] as const,
	},

	// Guestbook 관련
	guestbook: {
		all: ["guestbook"] as const,
		lists: () => [...queryKeys.guestbook.all, "list"] as const,
		list: (filters?: Record<string, any>) =>
			[...queryKeys.guestbook.lists(), filters] as const,
		userGuestbooks: (nickname: string) =>
			[...queryKeys.guestbook.all, "user", nickname] as const,
	},
};
