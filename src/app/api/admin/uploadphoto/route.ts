import { NextRequest } from "next/server";
import { POST as postPhotos } from "../photos/route";

export async function POST(request: NextRequest) {
	return postPhotos(request);
}
