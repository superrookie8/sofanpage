import React from "react";
import AdminDeletePhotos from "@/components/admin/AdminDeletePhotos";
import { headers } from "next/headers";

async function fetchPhotos(token: string) {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/get/photos`,
		{
			method: "GET",
			headers: {
				Authorization: token,
				"Content-Type": "application/json",
				Pragma: "no-cache",
				"Cache-Control": "no-cache, no-store, must-revalidate",
			},
			cache: "no-store",
		}
	);

	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.message || "Failed to fetch photos.");
	}

	return await response.json();
}

export default async function DeletePhotosPage() {
	const headersList = headers();
	const token = headersList.get("authorization") || "";

	const data = await fetchPhotos(token);

	return (
		<AdminDeletePhotos
			adminPhotos={data.admin_photos}
			userPhotos={data.user_photos}
		/>
	);
}
