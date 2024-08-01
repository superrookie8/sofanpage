// src/app/news/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import MainNews from "@/components/newsLatest";
import { Article } from "@/types/articles";

interface NewsData {
	main_article: Article;
	rookie_articles: Article[];
	jumpball_articles: Article[];
}

export default function News() {
	const [data, setData] = useState<NewsData | null>(null);

	useEffect(() => {
		async function fetchData() {
			const res = await fetch("/api/getnewslatest");
			const data = await res.json();
			setData(data);
		}
		fetchData();
	}, []);

	if (!data) {
		return <div>Loading...</div>;
	}
	return (
		<div>
			<div className="flex justify-center items-center ">
				<div className=" bg-white bg-opacity-75 min-h-screen w-full flex justify-center p-8 relative">
					<div className="bg-red-200 h-[300px] min-w-[1200px] flex p-8">
						<MainNews article={data.main_article} />
					</div>
				</div>
			</div>
		</div>
	);
}
