// src/features/events/types.ts
export interface Event {
	id: string;
	title: string;
}

export interface EventDetails extends Event {
	url: string | null;
	description: string | null;
	checkFields: {
		check1: string | null;
		check2: string | null;
		check3: string | null;
	};
	photos: string[];
}
