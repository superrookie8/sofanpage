import { NextRequest } from "next/server";
import { DELETE as deletePhotos } from "../photos/route";

export async function DELETE(request: NextRequest) {
	return deletePhotos(request);
}
