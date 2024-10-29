"use client";
import React, { useEffect, useState } from "react";
import MainNews from "@/components/news/newsLatest";
import { Article } from "@/types/articles";
import JumpballSection from "@/components/news/newsJumpball";
import RookieSection from "@/components/news/newsRookie";
import { useLoading } from "@/context/LoadingContext";
// import LoadingSpinner from "@/components/shared/loadingSpinner";

interface NewsData {
	main_article: Article;
}
interface SectionData {
	articles: Article[];
}

export default function News() {
	const { setIsLoading } = useLoading();
	const [data, setData] = useState<NewsData | null>(null);
	const [jump, setJump] = useState<SectionData | null>(null);
	const [rookie, setRookie] = useState<SectionData | null>(null);
	const [jumpPage, setJumpPage] = useState(1);
	const [rookiePage, setRookiePage] = useState(1);
	const articlesPerPage = 5;

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const res = await fetch("/api/getnewslatest");
				const data = await res.json();
				setData(data);
			} catch (error) {
				console.error("Error fetching main news:", error);
			} finally {
				setIsLoading(false);
			}
		};
		const fetchJumpballData = async () => {
			setIsLoading(true);
			try {
				const res = await fetch("/api/getnewsjumpball?q=이소희");
				const data = await res.json();
				setJump({ articles: data });
			} catch (error) {
				console.error("Error fetching jumpball news:", error);
			} finally {
				setIsLoading(false);
			}
		};
		const fetchRookieData = async () => {
			setIsLoading(true);
			try {
				const res = await fetch("/api/getnewsrookie?q=이소희");
				const data = await res.json();
				setRookie({ articles: data });
			} catch (error) {
				console.error("Error fetching rookie news:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
		fetchJumpballData();
		fetchRookieData();
	}, [setIsLoading]);

	if (!data || !jump || !rookie) {
		return <div className="flex justify-center items-center w-full h-screen bg-black bg-opacity-75 text-white">뉴스기사를 가져오고 있습니다...</div>; // 여기에 로딩 스피너 컴포넌트를 사용할 수 있습니다.
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
						<h2>최신기사</h2>
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
