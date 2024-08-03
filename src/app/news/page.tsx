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
			<div className="flex justify-center items-center ">
				<div className="bg-white bg-opacity-75 min-h-screen w-full flex-col justify-center p-8 relative">
					<div className="bg-red-200 min-h-screen w-full flex p-8">
						<MainNews article={data.main_article} />
					</div>
					<div className="bg-yellow-200 min-h-screen w-full flex flex-col  md:flex-row lg:flex-row   md:space-x-4 lg:space-x-4 justify-center p-8">
						<div className="w-full md:w-1/2 lg:w-1/2  items-center">
							<h2>Jumpball Section</h2>
							{displayedJumpballArticles.map((article) => (
								<JumpballSection key={article.link} jumpballarticle={article} />
							))}
							<div className="flex justify-between mt-4">
								<button
									disabled={jumpPage === 1}
									onClick={() => setJumpPage(jumpPage - 1)}
									className="px-4 py-2 bg-gray-300 disabled:opacity-50"
								>
									Previous
								</button>
								<button
									disabled={jumpPage * articlesPerPage >= jump.articles.length}
									onClick={() => setJumpPage(jumpPage + 1)}
									className="px-4 py-2 bg-gray-300 disabled:opacity-50"
								>
									Next
								</button>
							</div>
						</div>
						<div className="w-full md:w-1/2 lg:w-1/2 flex flex-col items-center">
							<h2>Rookie Section</h2>
							{displayedRookieArticles.map((article) => (
								<RookieSection key={article.link} rookiearticle={article} />
							))}
							<div className="flex justify-between mt-4">
								<button
									disabled={rookiePage === 1}
									onClick={() => setRookiePage(rookiePage - 1)}
									className="px-4 py-2 bg-gray-300 disabled:opacity-50"
								>
									Previous
								</button>
								<button
									disabled={
										rookiePage * articlesPerPage >= rookie.articles.length
									}
									onClick={() => setRookiePage(rookiePage + 1)}
									className="px-4 py-2 bg-gray-300 disabled:opacity-50"
								>
									Next
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
