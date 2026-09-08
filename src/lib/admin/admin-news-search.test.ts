import assert from "node:assert/strict";
import { test } from "vitest";
import { readFileSync } from "node:fs";
import {
  fetchSearchPage,
  parseSearchPage,
  searchInput,
  normalizeLink,
  SearchError,
} from "./news-search";
const fixture = JSON.parse(
  readFileSync(new URL("./fixtures/naver-news.json", import.meta.url), "utf8"),
);
test("fixture separates basketball, namesakes, ambiguity and normalized duplicates", () => {
  const result = parseSearchPage(fixture);
  assert.equal(result.inspected, 8);
  assert.equal(result.duplicates, 1);
  assert.equal(result.errors.length, 1);
  assert.equal(result.truncated, true);
  assert.deepEqual(
    result.candidates.map((c) => c.decision),
    ["accepted", "accepted", "rejected", "review", "review", "rejected"],
  );
  assert.equal(
    result.candidates[0].article.url,
    "https://jumpball.co.kr/news/1",
  );
  assert.equal(result.candidates[0].article.publishedAt, "2026-09-08T11:00:00");
  assert.equal(result.candidates[0].article.imageUrl, null);
});
test("input caps the entire inspected range at 1000", () => {
  assert.equal(
    searchInput({ query: " 월드컵 이소희 ", start: 901, display: 100 }).start,
    901,
  );
  for (const input of [
    { query: "" },
    { query: "x", start: 1000, display: 100 },
    { query: "x", display: 101 },
    { query: "x", start: 1.5 },
  ])
    assert.throws(() => searchInput(input), SearchError);
});
test("URL classification rejects spoofed hosts and unsafe links", () => {
  assert.equal(
    normalizeLink("https://rookie.co.kr/news/1?utm_source=x&idxno=3").url,
    "https://www.rookie.co.kr/news/1?idxno=3",
  );
  assert.equal(
    normalizeLink("https://jumpball.co.kr.evil.example/news/1").source,
    "other",
  );
  for (const value of [
    "file:///etc/passwd",
    "http://127.0.0.1/a",
    "https://user:pass@example.com/a",
    "http://[::1]/a",
  ])
    assert.throws(() => normalizeLink(value));
});
test("schema drift fails explicitly", () => {
  assert.throws(() => parseSearchPage({ total: 5, results: [] }), SearchError);
});
test("fetch uses a fixed host, bounded retry and no upstream error leakage", async () => {
  let calls = 0;
  const waits: number[] = [];
  const result = await fetchSearchPage(
    searchInput({ query: "월드컵 이소희" }),
    { id: "fixture-id", secret: "fixture-secret" },
    undefined,
    {
      fetcher: async (url, init) => {
        assert.equal(new URL(String(url)).origin, "https://openapi.naver.com");
        assert.equal(init?.redirect, "error");
        calls++;
        return calls < 3
          ? new Response("do not expose", { status: 503 })
          : Response.json(fixture);
      },
      pause: async (ms) => {
        waits.push(ms);
      },
    },
  );
  assert.equal(calls, 3);
  assert.deepEqual(waits, [500, 1000]);
  assert.equal(result.candidates.length, 6);
  calls = 0;
  await assert.rejects(
    () =>
      fetchSearchPage(
        searchInput({ query: "x" }),
        { id: "id", secret: "secret" },
        undefined,
        {
          fetcher: async () => {
            calls++;
            return new Response("secret upstream", { status: 401 });
          },
        },
      ),
    (e) => e instanceof SearchError && !e.message.includes("secret upstream"),
  );
  assert.equal(calls, 1);
});
test("missing credentials and cancellation make no provider calls", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls++;
    return Response.json(fixture);
  };
  await assert.rejects(
    () =>
      fetchSearchPage(
        searchInput({ query: "x" }),
        { id: "", secret: "" },
        undefined,
        { fetcher },
      ),
    (e) => e instanceof SearchError && e.status === 503,
  );
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(() =>
    fetchSearchPage(
      searchInput({ query: "x" }),
      { id: "id", secret: "secret" },
      controller.signal,
      { fetcher },
    ),
  );
  assert.equal(calls, 0);
});

test("youth basketball namesake signals stay unchecked for review", () => {
  const result = parseSearchPage({
    total: 1,
    items: [
      {
        ...fixture.items[0],
        title: "U18 이소희 농구",
        description: "숙명여고 대표",
      },
    ],
  });
  assert.equal(result.candidates[0].decision, "review");
});
