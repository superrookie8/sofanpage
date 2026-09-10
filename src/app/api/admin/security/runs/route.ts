import { NextRequest, NextResponse } from 'next/server';
import { adminBackendFetch } from '@/lib/admin/backend';
import { rejectCrossOriginMutation } from '@/lib/admin/request';
export async function GET(request: NextRequest) {
    const limit = request.nextUrl.searchParams.get('limit') ?? '20';
    if (!/^(?:[1-9]|1[0-9]|20)$/.test(limit))
        return NextResponse.json({ message: '조회 개수는 1~20이어야 합니다.' }, { status: 400 });
    return adminBackendFetch(`/api/admin/security/runs?limit=${limit}`);
}
export async function POST(request: NextRequest) {
    const rejected = rejectCrossOriginMutation(request);
    if (rejected)
        return rejected;
    try {
        const reader = request.body?.getReader();
        const chunks: Uint8Array[] = [];
        let size = 0;
        if (reader) {
            try {
                while (true) {
                    const part = await reader.read();
                    if (part.done)
                        break;
                    size += part.value.byteLength;
                    if (size > 1024) {
                        await reader.cancel();
                        return NextResponse.json({ message: '점검 요청이 너무 큽니다.' }, { status: 413 });
                    }
                    chunks.push(part.value);
                }
            }
            finally {
                reader.releaseLock();
            }
        }
        const combined = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.byteLength;
        }
        const text = new TextDecoder().decode(combined);
        const body = text.trim() ? JSON.parse(text) : {};
        if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length)
            throw new Error();
    }
    catch {
        return NextResponse.json({ message: '점검 요청에는 추가 입력을 보낼 수 없습니다.' }, { status: 400 });
    }
    return adminBackendFetch('/api/admin/security/runs', { method: 'POST', signal: AbortSignal.timeout(40000) });
}
