"use client";
import React, { useState } from "react";
import MainNews from "@/features/news/components/newsLatest";
import JumpballSection from "@/features/news/components/newsJumpball";
import RookieSection from "@/features/news/components/newsRookie";
import {
	useLatestNewsQuery,
	useJumpballNewsQuery,
	useRookieNewsQuery,
} from "@/features/news/queries";

export default function News() {
	const [jumpPage, setJumpPage] = useState(1);
	const [rookiePage, setRookiePage] = useState(1);
	const articlesPerPage = 5;

	// React Query를 사용하여 뉴스 데이터 조회
	const { data, isLoading: latestLoading } = useLatestNewsQuery();
	const { data: jump = { articles: [] } } = useJumpballNewsQuery(
		jumpPage,
		articlesPerPage
	);
	const { data: rookie = { articles: [] } } = useRookieNewsQuery(
		rookiePage,
		articlesPerPage
	);

	if (latestLoading || !data) {
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
								articles={jump.articles}
								page={jumpPage}
								setPage={setJumpPage}
								totalArticles={jump.total || 0}
								articlesPerPage={articlesPerPage}
							/>
						</div>
						<div className="w-full md:w-1/2 lg:w-1/2 mt-4 md:mt-0">
							<RookieSection
								articles={rookie.articles}
								page={rookiePage}
								setPage={setRookiePage}
								totalArticles={rookie.total || 0}
								articlesPerPage={articlesPerPage}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
