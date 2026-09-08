export interface GuestBookEntry {
	_id: string;
	name: string;
	message: string;
	date: string;
	photo_data?: string;
	photo_id?: string;
	hasPhoto?: boolean;
}
