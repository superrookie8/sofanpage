import { GET as getPhotos } from "../photos/route";

export async function GET() {
	return getPhotos();
}
