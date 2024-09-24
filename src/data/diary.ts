export interface DiaryEntry {
	_id: string;
	nickname: string;
	name: string;
	date: string;
	weather: string;
	location: string;
	together: string;
	win_status: string;
	diary_photos: {
		ticket_photo: string;
		view_photo: string;
		additional_photo?: string;
	};
	diary_message: string;
	seat_info: {
		section: string;
		row: string;
		number: string;
	};
}

