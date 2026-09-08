export type Article = {
  source: "jumpball" | "rookie" | "other";
  title: string;
  url: string;
  summary: string;
  imageUrl: null;
  publishedAt: string;
};
export type Candidate = {
  article: Article;
  decision: "accepted" | "review" | "rejected";
  reason: string;
};
export class SearchError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}
export function searchInput(input: unknown) {
  if (!input || typeof input !== "object")
    throw new SearchError("검색 조건을 확인해주세요.", 400);
  const { query, start = 1, display = 100 } = input as Record<string, unknown>;
  if (
    typeof query !== "string" ||
    !query.trim() ||
    query.trim().length > 100 ||
    !Number.isInteger(start) ||
    !Number.isInteger(display) ||
    Number(start) < 1 ||
    Number(display) < 1 ||
    Number(display) > 100 ||
    Number(start) + Number(display) - 1 > 1000
  )
    throw new SearchError(
      "검색어 1~100자, 조회 위치 1~1000, 페이지 크기 1~100을 사용해주세요.",
      400,
    );
  return {
    query: query.trim(),
    start: Number(start),
    display: Number(display),
  };
}
function plain(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(
      /&(amp|lt|gt|quot|apos|nbsp);/g,
      (_, k: string) =>
        ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " })[k] ??
        "",
    )
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n: string) => {
      const code =
        n[0].toLowerCase() === "x" ? parseInt(n.slice(1), 16) : Number(n);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
    })
    .replace(/\s+/g, " ")
    .trim();
}
export function normalizeLink(value: string) {
  const u = new URL(value);
  if (
    !["http:", "https:"].includes(u.protocol) ||
    u.username ||
    u.password ||
    u.port ||
    !u.hostname.includes(".") ||
    /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(1[6-9]|2\d|3[01])\.)/.test(
      u.hostname,
    ) ||
    u.hostname.includes(":")
  )
    throw new Error("invalid link");
  u.hash = "";
  const source = ["jumpball.co.kr", "www.jumpball.co.kr"].includes(u.hostname)
    ? "jumpball"
    : ["rookie.co.kr", "www.rookie.co.kr"].includes(u.hostname)
      ? "rookie"
      : "other";
  // Shared batch contract; backend also detects legacy HTTP/www/tracking identities.
  if (source !== "other") {
    u.protocol = "https:";
    u.hostname = source === "jumpball" ? "jumpball.co.kr" : "www.rookie.co.kr";
  }
  Array.from(u.searchParams.keys()).forEach((key) => {
    if (/^utm_|^(fbclid|gclid)$/i.test(key)) u.searchParams.delete(key);
  });
  return { url: u.toString(), source } as {
    url: string;
    source: Article["source"];
  };
}
export function parseSearchPage(raw: unknown) {
  if (!raw || typeof raw !== "object")
    throw new SearchError("네이버 응답 형식이 변경되었습니다.");
  const data = raw as Record<string, unknown>;
  if (
    !Number.isInteger(data.total) ||
    Number(data.total) < 0 ||
    !Array.isArray(data.items) ||
    data.items.length > 100
  )
    throw new SearchError("네이버 응답 형식이 변경되었습니다.");
  const candidates: Candidate[] = [];
  const errors: {
    index: number;
    code: string;
  }[] = [];
  const seen = new Set<string>();
  let duplicates = 0;
  data.items.forEach((rawItem: unknown, index: number) => {
    try {
      if (!rawItem || typeof rawItem !== "object") throw new Error();
      const item = rawItem as Record<string, unknown>;
      if (
        ![item.title, item.description, item.pubDate, item.link].every(
          (x) => typeof x === "string",
        )
      )
        throw new Error();
      const title = plain(item.title as string);
      const summary = plain(item.description as string);
      const normalized = normalizeLink(
        typeof item.originallink === "string" && item.originallink
          ? item.originallink
          : (item.link as string),
      );
      const date = new Date(item.pubDate as string);
      if (
        !title ||
        title.length > 300 ||
        summary.length > 20000 ||
        normalized.url.length > 2000 ||
        !Number.isFinite(date.getTime())
      )
        throw new Error();
      if (seen.has(normalized.url)) {
        duplicates++;
        return;
      }
      seen.add(normalized.url);
      const text = `${title} ${summary}`;
      const basketball = /농구|BNK|WKBL|여자농구|바스켓|부산\s*썸/i.test(text);
      const namesake =
        /배드민턴|셔틀콕|복식|한소희|배우|드라마|숙명여고|U-?18|18세 이하|청소년 대표|청소년 국가대표|원조 머슬녀/i.test(
          text,
        );
      const decision =
        !text.includes("이소희") || (namesake && !basketball)
          ? "rejected"
          : basketball && !namesake
            ? "accepted"
            : "review";
      candidates.push({
        article: {
          ...normalized,
          title,
          summary,
          imageUrl: null,
          publishedAt: new Date(date.getTime() + 9 * 3600000)
            .toISOString()
            .slice(0, 19),
        },
        decision,
        reason:
          decision === "accepted"
            ? "이소희 이름과 농구 관련 문맥 확인"
            : decision === "rejected"
              ? "이름 불일치 또는 동명이인 문맥"
              : "선수 동일인 여부를 원문에서 확인해주세요",
      });
    } catch {
      errors.push({ index, code: "invalid_article_metadata" });
    }
  });
  return {
    total: Number(data.total),
    inspected: data.items.length,
    candidates,
    duplicates,
    errors,
    cap: 1000,
    truncated: Number(data.total) > 1000,
  };
}
export async function fetchSearchPage(
  input: ReturnType<typeof searchInput>,
  credentials: {
    id: string;
    secret: string;
  },
  signal?: AbortSignal,
  deps: {
    fetcher?: typeof fetch;
    pause?: (ms: number) => Promise<void>;
  } = {},
) {
  if (!credentials.id || !credentials.secret)
    throw new SearchError("네이버 검색 API 설정이 필요합니다.", 503);
  const fetcher = deps.fetcher ?? fetch;
  const pause =
    deps.pause ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const url = new URL("https://openapi.naver.com/v1/search/news.json");
  url.search = new URLSearchParams({
    query: input.query,
    start: String(input.start),
    display: String(input.display),
    sort: "sim",
  }).toString();
  for (let attempt = 0; attempt < 3; attempt++) {
    signal?.throwIfAborted();
    try {
      const response = await fetcher(url, {
        headers: {
          "X-Naver-Client-Id": credentials.id,
          "X-Naver-Client-Secret": credentials.secret,
          "User-Agent": "SupersoheeAdminNews/1.0",
        },
        redirect: "error",
        cache: "no-store",
        signal: signal
          ? (AbortSignal as typeof AbortSignal & { any(signals: AbortSignal[]): AbortSignal }).any([signal, AbortSignal.timeout(8000)])
          : AbortSignal.timeout(8000),
      });
      if (response.ok) return parseSearchPage(await response.json());
      if (response.status !== 429 && response.status < 500)
        throw new SearchError(
          "네이버 검색 API 권한 또는 요청 설정을 확인해주세요.",
          502,
        );
      if (attempt === 2)
        throw new SearchError(
          response.status === 429
            ? "네이버 호출 한도에 도달했습니다. 잠시 후 재시도해주세요."
            : "네이버 검색에 일시적인 오류가 발생했습니다.",
          response.status === 429 ? 429 : 502,
        );
    } catch (error) {
      if (signal?.aborted) throw error;
      if (error instanceof SearchError || attempt === 2)
        throw error instanceof SearchError
          ? error
          : new SearchError(
              "네이버 연결에 실패했습니다. 수집된 후보는 유지됩니다.",
            );
    }
    await pause(500 * (attempt + 1));
  }
  throw new SearchError("네이버 검색에 실패했습니다.");
}
