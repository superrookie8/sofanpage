"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Article = {
	id: string;
	source: string;
	title: string;
	url?: string;
	summary?: string;
	publishedAt?: string;
};

type ArticlePage = {
	content: Article[];
	page: number;
	totalPages: number;
	hasNext: boolean;
};

export default function NewsInput() {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [page, setPage] = useState(0);
	const [articles, setArticles] = useState<ArticlePage>({ content: [], page: 0, totalPages: 0, hasNext: false });
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState("");
	const [source, setSource] = useState("");
	const [filters, setFilters] = useState({ q: "", source: "" });
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const loadArticles = useCallback(async () => {
		const params = new URLSearchParams({ page: String(page), size: "20" });
		if (filters.q) params.set("q", filters.q);
		if (filters.source) params.set("source", filters.source);
		const response = await fetch(`/api/admin/articles?${params}`, { cache: "no-store" });
		const body = await response.json().catch(() => ({}));
		if (!response.ok) throw new Error(body.message || body.error || "기사 목록을 불러오지 못했습니다.");
		setArticles(body);
	}, [page, filters]);

	useEffect(() => {
		loadArticles().catch((error) => setMessage(error.message));
	}, [loadArticles]);

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		setLoading(true);
		setMessage("");
		try {
			const response = await fetch("/api/admin/articles", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ title, content }),
			});
			const body = await response.json().catch(() => ({}));
			if (!response.ok) throw new Error(body.message || body.error || "기사를 저장하지 못했습니다.");
			setTitle("");
			setContent("");
			setMessage("기사를 저장했습니다.");
			if (page !== 0) setPage(0);
			else await loadArticles();
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "기사를 저장하지 못했습니다.");
		} finally {
			setLoading(false);
		}
	};

	const search = (event: FormEvent) => {
		event.preventDefault();
		setFilters({ q: query.trim(), source });
		setPage(0);
	};

	const remove = async (article: Article) => {
		if (!window.confirm(`“${article.title}” 기사를 삭제할까요? 삭제하면 되돌릴 수 없습니다.`)) return;
		setDeletingId(article.id);
		setMessage("");
		try {
			const response = await fetch(`/api/admin/articles/${article.id}`, { method: "DELETE" });
			if (!response.ok) {
				const body = await response.json().catch(() => ({}));
				throw new Error(body.message || "기사를 삭제하지 못했습니다.");
			}
			setMessage("기사를 삭제했습니다.");
			if (articles.content.length === 1 && page > 0) setPage(page - 1);
			else await loadArticles();
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "기사를 삭제하지 못했습니다.");
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
			<form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h2 className="mb-5 text-xl font-bold">수동 기사 작성</h2>
				<label className="mb-4 block"><span className="mb-2 block text-sm font-semibold">제목</span><input className="w-full rounded-lg border px-3 py-2" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={300} required /></label>
				<label className="mb-4 block"><span className="mb-2 block text-sm font-semibold">내용</span><textarea className="min-h-56 w-full rounded-lg border px-3 py-2" value={content} onChange={(event) => setContent(event.target.value)} maxLength={20000} required /></label>
				<button className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={loading}>{loading ? "저장 중..." : "기사 저장"}</button>
				{message && <p className="mt-4 text-sm" role="status">{message}</p>}
			</form>
			<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h2 className="mb-5 text-xl font-bold">기사 목록</h2>
				<form onSubmit={search} className="mb-4 flex flex-wrap gap-2" role="search" aria-label="기사 검색">
					<input className="min-w-0 flex-1 rounded-lg border px-3 py-2" value={query} onChange={(event) => setQuery(event.target.value)} maxLength={100} placeholder="제목 검색" aria-label="제목 검색" />
					<select className="rounded-lg border px-3 py-2" value={source} onChange={(event) => setSource(event.target.value)} aria-label="출처">
						<option value="">전체 출처</option><option value="jumpball">점프볼</option><option value="rookie">루키</option><option value="other">그외</option><option value="manual">수동</option>
					</select>
					<button className="rounded-lg border px-4 py-2 font-semibold">검색</button>
				</form>
				{articles.content.length === 0 && <p className="text-sm text-slate-500">{filters.q || filters.source ? "검색 결과가 없습니다." : "기사가 없습니다."}</p>}
				<ul className="space-y-3">
					{articles.content.map((article) => <li key={article.id} className="rounded-xl border p-4"><div className="mb-1 flex justify-between gap-3"><strong>{article.url ? <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{article.title}</a> : article.title}</strong><span className="shrink-0 text-xs uppercase text-slate-500">{article.source}</span></div>{article.summary && <p className="line-clamp-3 text-sm text-slate-600">{article.summary}</p>}<div className="mt-2 flex items-center justify-between gap-3"><small className="text-slate-400">{article.publishedAt ? new Date(article.publishedAt).toLocaleString("ko-KR") : "날짜 없음"}</small><button type="button" className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 disabled:opacity-50" disabled={deletingId !== null} onClick={() => { void remove(article); }}>{deletingId === article.id ? "삭제 중..." : "삭제"}</button></div></li>)}
				</ul>
				<div className="mt-5 flex items-center justify-between"><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>이전</button><span className="text-sm">{articles.totalPages ? `${page + 1} / ${articles.totalPages}` : "0 / 0"}</span><button className="rounded border px-3 py-1 disabled:opacity-40" disabled={!articles.hasNext} onClick={() => setPage((value) => value + 1)}>다음</button></div>
			</section>
		</div>
	);
}
