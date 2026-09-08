"use client";
import { useRef, useState, useEffect } from "react";
import type { Candidate } from "@/lib/admin/news-search";
type Page = {
  total: number;
  inspected: number;
  candidates: Candidate[];
  duplicates: number;
  errors: unknown[];
  nextStart: number | null;
  truncated: boolean;
};
const labels = { jumpball: "점프볼", rookie: "루키", other: "그외" };
export default function NewsSearch() {
  const [query, setQuery] = useState("월드컵 이소희"),
    [items, setItems] = useState<Candidate[]>([]),
    [selected, setSelected] = useState<Set<string>>(new Set()),
    [busy, setBusy] = useState(false),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState(""),
    [progress, setProgress] = useState({
      total: 0,
      inspected: 0,
      duplicates: 0,
      errors: 0,
    });
  const control = useRef<AbortController | null>(null);
  useEffect(() => () => control.current?.abort(), []);
  async function search() {
    const controller = new AbortController();
    control.current = controller;
    setBusy(true);
    setItems([]);
    setSelected(new Set());
    setMessage("검색 중입니다. 후보를 검토한 뒤 등록하세요.");
    setProgress({ total: 0, inspected: 0, duplicates: 0, errors: 0 });
    const collected = new Map<string, Candidate>();
    let inspected = 0,
      duplicates = 0,
      errors = 0,
      start: number | null = 1;
    try {
      while (start !== null) {
        const response = await fetch("/api/admin/articles/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, start, display: 100 }),
          signal: controller.signal,
        });
        const page = await response.json();
        if (!response.ok) throw new Error(page.message ?? "검색 실패");
        const data = page as Page;
        inspected += data.inspected;
        duplicates += data.duplicates;
        errors += data.errors.length;
        for (const candidate of data.candidates) {
          if (collected.has(candidate.article.url)) {
            duplicates++;
            continue;
          }
          collected.set(candidate.article.url, candidate);
        }
        setItems(Array.from(collected.values()));
        setProgress({ total: data.total, inspected, duplicates, errors });
        start = data.nextStart;
        if (start !== null) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          controller.signal.throwIfAborted();
        } else
          setMessage(
            data.truncated
              ? "조회 한도 1,000건에 도달했습니다. 검색어에 대회명·연도 등을 추가해 범위를 좁히세요."
              : "조회가 끝났습니다. 등록할 기사를 선택하세요.",
          );
      }
    } catch (error) {
      setMessage(
        controller.signal.aborted
          ? "검색을 중단했습니다. 지금까지 수집한 후보는 남아 있습니다."
          : `${error instanceof Error ? error.message : "검색 실패"} · 수집된 후보는 유지됩니다. 다시 검색할 수 있습니다.`,
      );
    } finally {
      setBusy(false);
      control.current = null;
    }
  }
  async function save() {
    setSaving(true);
    let created = 0,
      existing = 0;
    try {
      const queue = items.filter(
        (x) => selected.has(x.article.url) && x.decision !== "rejected",
      );
      for (let i = 0; i < queue.length; i += 200) {
        const batch = queue.slice(i, i + 200);
        const response = await fetch("/api/admin/articles/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articles: batch.map((x) => x.article) }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message ?? "등록 실패");
        created += result.created;
        existing += result.existing;
        setSelected((previous) => {
          const next = new Set(previous);
          batch.forEach((x) => next.delete(x.article.url));
          return next;
        });
      }
      setMessage(
        `등록 완료: 새 기사 ${created}건, 기존 기사 ${existing}건. 기존 내용은 덮어쓰지 않습니다.`,
      );
    } catch (error) {
      setMessage(
        `일부 등록 후 중단될 수 있습니다. 완료: 신규 ${created}건 / 기존 ${existing}건. ${error instanceof Error ? error.message : "등록 실패"} 남은 선택 항목은 다시 등록할 수 있습니다.`,
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <section
      className="space-y-4 rounded-xl border bg-white p-6 mb-6"
      aria-labelledby="news-search-title"
    >
      <h2 id="news-search-title" className="text-xl font-bold">
        요청할 때 뉴스 수집
      </h2>
      <p>
        네이버 뉴스 검색 API의 제목·요약·원문 링크를 조회합니다. 포털 화면과
        결과가 다를 수 있으며 최대 1,000건까지 확인합니다. 본문 전체·썸네일은
        수집하지 않습니다.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
        className="flex flex-wrap gap-3"
      >
        <label className="flex-1">
          검색어
          <input
            className="block w-full border rounded p-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={100}
            required
            disabled={busy || saving}
          />
        </label>
        <button
          className="rounded bg-black text-white px-4"
          disabled={busy || saving}
        >
          검색해서 후보 모으기
        </button>
        {busy && (
          <button
            type="button"
            className="border rounded px-4"
            onClick={() => control.current?.abort()}
          >
            수집 중단
          </button>
        )}
      </form>
      <p role="status" aria-live="polite">
        {message}
      </p>
      <p>
        API 검색 결과 {progress.total}건 · 확인 {progress.inspected}건 · 검색 내
        중복 {progress.duplicates}건 · 메타데이터 오류 {progress.errors}건
      </p>
      <p>
        채택 {items.filter((x) => x.decision === "accepted").length}건 · 검토
        보류 {items.filter((x) => x.decision === "review").length}건 · 제외{" "}
        {items.filter((x) => x.decision === "rejected").length}건. DB 중복은
        등록 시 확인합니다.
      </p>
      <div className="flex gap-3">
        <button
          className="border rounded p-2"
          disabled={busy || saving}
          onClick={() =>
            setSelected(
              new Set(
                items
                  .filter((x) => x.decision === "accepted")
                  .map((x) => x.article.url),
              ),
            )
          }
        >
          채택 후보 선택
        </button>
        <button
          className="border rounded p-2"
          disabled={busy || saving}
          onClick={() => setSelected(new Set())}
        >
          선택 해제
        </button>
        <button
          className="bg-black text-white rounded p-2"
          disabled={busy || saving || selected.size === 0}
          onClick={() => void save()}
        >
          {saving ? "등록 중…" : `선택 ${selected.size}건 등록`}
        </button>
      </div>
      <p>
        보류 기사는 원문을 열어 농구선수 이소희 기사인지 확인한 뒤 개별
        선택하세요.
      </p>
      <ul className="space-y-3 max-h-[640px] overflow-auto">
        {items.map(({ article, decision, reason }) => (
          <li key={article.url} className="border rounded p-3">
            <label className="flex gap-2">
              <input
                type="checkbox"
                aria-label={`${article.title} 등록 선택`}
                disabled={busy || saving || decision === "rejected"}
                checked={selected.has(article.url)}
                onChange={(e) =>
                  setSelected((previous) => {
                    const next = new Set(previous);
                    if (e.target.checked) next.add(article.url);
                    else next.delete(article.url);
                    return next;
                  })
                }
              />
              <span>
                [{labels[article.source]}] {article.title}
              </span>
            </label>
            <p className="text-sm my-2">{article.summary}</p>
            <p className="text-sm">
              {article.publishedAt.replace("T", " ")} (한국 시간) ·{" "}
              {decision === "accepted"
                ? "채택"
                : decision === "review"
                  ? "검토 보류"
                  : "제외"}{" "}
              · {reason}
            </p>
            <a
              className="underline"
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              원문 확인
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
