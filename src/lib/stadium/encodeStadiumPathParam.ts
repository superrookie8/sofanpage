/** 경기장 id/이름을 URL path segment로 안전하게 넣기 */
export function encodeStadiumPathParam(stadiumIdOrName: string): string {
	return encodeURIComponent(stadiumIdOrName.trim());
}

export function decodeStadiumPathParam(segment: string): string {
	return decodeURIComponent(segment);
}
