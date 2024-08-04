"use client";
import React, { useEffect, useState } from "react";
import MainNews from "@/components/newsLatest";
import { Article } from "@/types/articles";
import JumpballSection from "@/components/newsJumpball";
import RookieSection from "@/components/newsRookie";

interface NewsData {
	main_article: Article;
}
interface SectionData {
	articles: Article[];
}

export default function News() {
	const [data, setData] = useState<NewsData | null>(null);
	const [jump, setJump] = useState<SectionData | null>(null);
	const [rookie, setRookie] = useState<SectionData | null>(null);
	const [jumpPage, setJumpPage] = useState(1);
	const [rookiePage, setRookiePage] = useState(1);
	const articlesPerPage = 5;

	useEffect(() => {
		async function fetchData() {
			const res = await fetch("/api/getnewslatest");
			const data = await res.json();
			setData(data);
		}
		async function fetchJumpballData() {
			const res = await fetch("/api/getnewsjumpball?q=이소희");
			const data = await res.json();
			setJump({ articles: data });
		}
		async function fetchRookieData() {
			const res = await fetch("/api/getnewsrookie?q=이소희");
			const data = await res.json();
			setRookie({ articles: data });
		}
		fetchData();
		fetchJumpballData();
		fetchRookieData();
	}, []);

	if (!data || !jump || !jump.articles || !rookie || !rookie.articles) {
		return <div>Loading...</div>;
	}

	const paginate = (articles: Article[], page: number, perPage: number) => {
		const startIndex = (page - 1) * perPage;
		const endIndex = startIndex + perPage;
		return articles.slice(startIndex, endIndex);
	};

	const displayedJumpballArticles = paginate(
		jump.articles,
		jumpPage,
		articlesPerPage
	);

	const displayedRookieArticles = paginate(
		rookie.articles,
		rookiePage,
		articlesPerPage
	);

	return (
		<div>
			<div className="flex justify-center items-center">
				<div className="bg-white bg-opacity-75 min-h-screen w-full flex-col justify-center p-8 relative">
					<div className="min-h-[50vh] w-full flex flex-col items-center p-8">
						<h2>Main Article</h2>
						<div className="bg-white grid rounded-lg shadow-md">
							<MainNews article={data.main_article} />
						</div>
					</div>
					<div className=" min-h-screen w-full flex flex-col md:flex-row lg:flex-row md:space-x-4 lg:space-x-4 justify-center">
						<div className="w-full md:w-1/2 lg:w-1/2 mt-4 md:mt-0">
							<JumpballSection
								articles={displayedJumpballArticles}
								page={jumpPage}
								setPage={setJumpPage}
								totalArticles={jump.articles.length}
								articlesPerPage={articlesPerPage}
							/>
						</div>
						<div className="w-full md:w-1/2 lg:w-1/2 mt-4 md:mt-0">
							<RookieSection
								articles={displayedRookieArticles}
								page={rookiePage}
								setPage={setRookiePage}
								totalArticles={rookie.articles.length}
								articlesPerPage={articlesPerPage}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
