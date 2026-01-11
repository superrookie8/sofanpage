// src/features/events/types.ts
export interface Event {
	id: string;
	title: string;
}

export interface EventDetails extends Event {
	url: string;
	description: string;
	checkFields: {
		check1: string;
		check2: string;
		check3: string;
	};
	photos: string[];
	photoKeys: string[];
}

export interface PhotosResponse {
	photos: string[];
	total_pages: number;
	page: number;
	page_size: number;
}
