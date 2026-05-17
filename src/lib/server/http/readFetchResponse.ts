/** Netlify 등에서 fetch Response.text()가 "Body is unusable"일 때 대비 */
export async function readFetchResponseAsText(
	response: Response
): Promise<string> {
	const buffer = await response.arrayBuffer();
	return new TextDecoder("utf-8").decode(buffer);
}
