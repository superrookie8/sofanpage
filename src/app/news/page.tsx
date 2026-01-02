"use client";
import React, { useEffect, useState } from "react";
import MainNews from "@/components/news/newsLatest";
import { Article } from "@/types/articles";
import JumpballSection from "@/components/news/newsJumpball";
import RookieSection from "@/components/news/newsRookie";
import { useLoading } from "@/context/LoadingContext";
// import LoadingSpinner from "@/components/shared/loadingSpinner";

interface NewsData {
	main_article?: Article;
}
interface SectionData {
	articles: Article[];
	total?: number;
	totalPages?: number;
	hasNext?: boolean;
	hasPrevious?: boolean;
}

export default function News() {
	const { setIsLoading } = useLoading();
	const [data, setData] = useState<NewsData | null>(null);
	const [jump, setJump] = useState<SectionData>({ articles: [] });
	const [rookie, setRookie] = useState<SectionData>({ articles: [] });
	const [jumpPage, setJumpPage] = useState(1);
	const [rookiePage, setRookiePage] = useState(1);
	const articlesPerPage = 5;

	// 최신 기사 가져오기
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				const res = await fetch("/api/getnewslatest");
				
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				
				const data = await res.json();
				// 백엔드가 단일 Article 객체를 반환하는 경우
				if (data.id || data.title) {
					setData({ main_article: data });
				} else {
					setData(data);
				}
			} catch (error) {
				console.error("Error fetching main news:", error);
				setData(null);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [setIsLoading]);

	// Jumpball 기사 가져오기 (페이지 변경 시마다)
	useEffect(() => {
		const fetchJumpballData = async () => {
			setIsLoading(true);
			try {
				// 백엔드는 0부터 시작하므로 jumpPage - 1
				const res = await fetch(`/api/getnewsjumpball?page=${jumpPage - 1}&limit=${articlesPerPage}`);
				
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				
				const data = await res.json();
				// 백엔드 응답 형식: { articles: [...], total: 1000, totalPages: 200, ... }
				if (data.articles && Array.isArray(data.articles)) {
					setJump({
						articles: data.articles,
						total: data.total || 0,
						totalPages: data.totalPages || 0,
						hasNext: data.hasNext || false,
						hasPrevious: data.hasPrevious || false,
					});
				} else {
					setJump({ articles: [] });
				}
			} catch (error) {
				console.error("Error fetching jumpball news:", error);
				setJump({ articles: [] });
			} finally {
				setIsLoading(false);
			}
		};

		fetchJumpballData();
	}, [jumpPage, articlesPerPage, setIsLoading]);

	// Rookie 기사 가져오기 (페이지 변경 시마다)
	useEffect(() => {
		const fetchRookieData = async () => {
			setIsLoading(true);
			try {
				// 백엔드는 0부터 시작하므로 rookiePage - 1
				const res = await fetch(`/api/getnewsrookie?page=${rookiePage - 1}&limit=${articlesPerPage}`);
				
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				
				const data = await res.json();
				// 백엔드 응답 형식: { articles: [...], total: 1000, totalPages: 200, ... }
				if (data.articles && Array.isArray(data.articles)) {
					setRookie({
						articles: data.articles,
						total: data.total || 0,
						totalPages: data.totalPages || 0,
						hasNext: data.hasNext || false,
						hasPrevious: data.hasPrevious || false,
					});
				} else {
					setRookie({ articles: [] });
				}
			} catch (error) {
				console.error("Error fetching rookie news:", error);
				setRookie({ articles: [] });
			} finally {
				setIsLoading(false);
			}
		};

		fetchRookieData();
	}, [rookiePage, articlesPerPage, setIsLoading]);

	if (!data) {
		return (
			<div className="flex justify-center items-center w-full h-screen bg-black bg-opacity-75 text-white">
				뉴스기사를 가져오고 있습니다...
			</div>
		);
	}

	return (
		<div>
			<div className="flex justify-center items-center">
				<div className="bg-white bg-opacity-75 min-h-screen w-full flex-col justify-center p-8 relative">
					<div className="min-h-[50vh] w-full flex flex-col items-center p-8">
						<h2>최신기사</h2>
						{data.main_article && (
							<div className="bg-white grid rounded-lg shadow-md">
								<MainNews article={data.main_article} />
							</div>
						)}
					</div>
					<div className=" min-h-screen w-full flex flex-col md:flex-row lg:flex-row md:space-x-4 lg:space-x-4 justify-center">
						<div className="w-full md:w-1/2 lg:w-1/2 mt-4 md:mt-0">
							<JumpballSection
								articles={jump?.articles || []}
								page={jumpPage}
								setPage={setJumpPage}
								totalArticles={jump?.total || 0}
								articlesPerPage={articlesPerPage}
							/>
						</div>
						<div className="w-full md:w-1/2 lg:w-1/2 mt-4 md:mt-0">
							<RookieSection
								articles={rookie?.articles || []}
								page={rookiePage}
								setPage={setRookiePage}
								totalArticles={rookie?.total || 0}
								articlesPerPage={articlesPerPage}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
