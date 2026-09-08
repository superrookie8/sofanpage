"use client";
import { useState } from "react";
import type { SecurityCheck } from "@/lib/admin/security";
export default function SecurityPage() {
  const [checks, setChecks] = useState<SecurityCheck[]>([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function check() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/security/status", {
        cache: "no-store",
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message ?? "점검 실패");
      setChecks(body.checks);
      setMessage(
        `점검 시각: ${new Date(body.checkedAt).toLocaleString("ko-KR")}`,
      );
    } catch (error) {
      setChecks([]);
      setMessage(error instanceof Error ? error.message : "점검 실패");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="rounded-xl border bg-white p-6 space-y-4">
      <h2 className="text-xl font-bold">관리자 보안 설정 점검</h2>
      <p>
        현재 관리자 권한을 서버에서 확인하고 세션·출처·연결 설정을 읽기 전용으로
        점검합니다. 결과에 비밀값이나 내부 주소는 표시하지 않습니다.
      </p>
      <button
        className="rounded bg-black text-white p-3"
        disabled={busy}
        onClick={() => void check()}
      >
        {busy ? "점검 중…" : "보안 설정 점검 실행"}
      </button>
      <p role="status">{message}</p>
      <ul className="space-y-3">
        {checks.map((c) => (
          <li key={c.id} className="border rounded p-3">
            <strong>
              {c.status === "pass"
                ? "통과"
                : c.status === "warn"
                  ? "확인 필요"
                  : "조치 필요"}
            </strong>{" "}
            · {c.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
