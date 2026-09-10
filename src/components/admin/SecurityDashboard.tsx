"use client";
import {categoryLabels, checkTitles, checkGuidance, orderedChecks} from "@/lib/admin/securityCatalog";
import { useEffect, useState } from "react";
import { auditError, auditStatusLabels, type AuditRun } from "@/lib/admin/securityRuns";
import type { SecurityCheck } from "@/lib/admin/security";
export function CurrentConfiguration() {
    const [checks, setChecks] = useState<SecurityCheck[]>([]), [message, setMessage] = useState(""), [busy, setBusy] = useState(false);
    async function check() {
        setBusy(true);
        setMessage("");
        try {
            const response = await fetch("/api/admin/security/status", {
                cache: "no-store",
            });
            const body = await response.json();
            if (!response.ok)
                throw new Error(body.message ?? "점검 실패");
            setChecks(body.checks);
            setMessage(`점검 시각: ${new Date(body.checkedAt).toLocaleString("ko-KR")}`);
        }
        catch (error) {
            // Keep the previously observed configuration when a refresh fails.
            setMessage(error instanceof Error ? error.message : "점검 실패");
        }
        finally {
            setBusy(false);
        }
    }
    return (<section className="rounded-xl border bg-white p-6 space-y-4">
      <h2 className="text-xl font-bold">현재 프론트엔드·연결 설정</h2>
      <p>
        현재 관리자 권한을 서버에서 확인하고 세션·출처·연결 설정을 읽기 전용으로
        점검합니다. 결과에 비밀값이나 내부 주소는 표시하지 않습니다.
      </p>
      <button className="rounded bg-black text-white p-3" disabled={busy} onClick={() => void check()}>
        {busy ? "점검 중…" : "보안 설정 점검 실행"}
      </button>
      <p role="status">{message}</p>
      <ul className="space-y-3">
        {checks.map((c) => (<li key={c.id} className="border rounded p-3">
            <strong>
              {c.status === "pass"
                ? "통과"
                : c.status === "warn"
                    ? "확인 필요"
                    : c.status === "unknown" ? "미확인" : "조치 필요"}
            </strong>{" "}
            · {c.message}
          </li>))}
      </ul>
    </section>);
}
export default function SecurityPage() {
    const [runs, setRuns] = useState<AuditRun[]>([]), [selected, setSelected] = useState<AuditRun | null>(null);
    const [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState("");
    async function history() {
        setLoading(true);
        try {
            const response = await fetch("/api/admin/security/runs?limit=20", { cache: "no-store" });
            if (!response.ok)
                throw new Error(auditError(response.status));
            const body = await response.json();
            if (!Array.isArray(body.runs))
                throw new Error("이력 응답을 확인할 수 없습니다.");
            setRuns(body.runs);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "이력 조회 실패");
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => { void history(); }, []);
    async function execute() {
        setBusy(true);
        setError("");
        try {
            const response = await fetch("/api/admin/security/runs", { method: "POST" });
            if (!response.ok)
                throw new Error(auditError(response.status));
            const run: AuditRun = await response.json();
            setSelected(run);
            setRuns(current => [run, ...current.filter(item => item.id !== run.id)].slice(0, 20));
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "점검 실패");
        }
        finally {
            setBusy(false);
        }
    }
    async function detail(id: string) {
        setError("");
        try {
            const response = await fetch(`/api/admin/security/runs/${encodeURIComponent(id)}`, { cache: "no-store" });
            if (!response.ok)
                throw new Error(auditError(response.status));
            setSelected(await response.json());
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "상세 조회 실패");
        }
    }
    return <div className="space-y-6">
  <section className="rounded-xl border bg-white p-6 space-y-4">
   <h2 className="text-xl font-bold">서비스 보안 점검</h2>
   <p>웹·API 코드 저장소, 자동 수집, DB·이미지 저장소를 점검합니다. 결과는 30일 이내 최근 20회 보관합니다.</p>
   <button disabled={busy} onClick={() => void execute()} className="rounded bg-black text-white p-3">{busy ? "점검 실행 중…" : "보안 점검 실행 및 저장"}</button>
   {error && <p role="alert">{error}</p>}
   <h3 className="font-bold">저장된 실행 이력</h3>
   <button disabled={loading} onClick={() => { setError(""); void history(); }} className="underline">이력 새로고침</button>
   {loading ? <p role="status">이력을 불러오는 중…</p> : runs.length === 0 && !error ? <p>저장된 점검 이력이 없습니다.</p> : null}
   <ul>{runs.map(run => <li key={run.id}><button className="underline py-2" onClick={() => void detail(run.id)}>{new Date(run.startedAt).toLocaleString("ko-KR")} · 조치 필요 {run.summary.fail} · 미확인 {run.summary.unknown}</button></li>)}</ul>
   {selected && <RunResult run={selected}/>}
  </section><CurrentConfiguration />
 </div>;
}
export function RunResult({ run }: {
    run: AuditRun;
}) {
    const [category,setCategory]=useState("");
    const tones={pass:"border-emerald-300 bg-emerald-50 text-emerald-900",warn:"border-amber-300 bg-amber-50 text-amber-900",fail:"border-red-300 bg-red-50 text-red-900",unknown:"border-slate-300 bg-slate-50 text-slate-900"};
    const mode = { production: "운영 모드", 'non-production': "비운영 모드", unknown: "모드 미확인" };
    const target = { 'https-configured': "HTTPS 대상 설정", 'loopback-development': "로컬 개발 대상", unknown: "대상 미확인" };
    return <section className="space-y-3 border-t pt-4"><h3 className="font-bold">실행 결과</h3>
  <p>{mode[run.environment.backendMode]} · {target[run.environment.frontendTarget]}</p>
  <p>완료: {new Date(run.finishedAt).toLocaleString("ko-KR")} · {run.durationMs}ms</p>
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{(["fail","warn","unknown","pass"] as const).map(status=><div key={status} className={`rounded-lg border p-3 ${tones[status]}`}><p>{auditStatusLabels[status]}</p><strong className="text-2xl">{run.summary[status]}</strong></div>)}</div>
  <label className="block">점검 분야 <select className="rounded border p-2" value={category} onChange={event=>setCategory(event.target.value)}><option value="">전체 분야</option>{Object.entries(categoryLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
  <ul className="space-y-3">{orderedChecks(run.checks,category).map(check => <li key={check.id} className={`rounded border p-3 ${tones[check.status]}`}><p className="text-sm">{categoryLabels[check.category]||"미분류"}</p><strong>{auditStatusLabels[check.status]} · {checkTitles[check.id]||check.title}</strong>
   <p>근거 유형: {({ configuration: "설정", 'runtime-http': "HTTP 응답 관측", 'database-read': "DB 읽기", 'manual-review': "수동 검토", 'provider-api': "외부 서비스 API 관측" })[check.evidenceType] || "미분류 근거"}</p>
   <p>확인·조치: {checkGuidance(check)}</p><details className="mt-2"><summary className="cursor-pointer underline">서버 원문 근거·조치 확인</summary><p>{check.title}</p><p>{check.evidence}</p><p>{check.remediation}</p></details>
   <p className="text-sm">{new Date(check.checkedAt).toLocaleString("ko-KR")} · {check.durationMs}ms{check.observedStatus !== undefined ? ` · HTTP ${check.observedStatus}` : ""}</p>
  </li>)}</ul></section>;
}
