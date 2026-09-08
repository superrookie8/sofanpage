import { NextResponse } from 'next/server';
import { adminBackendFetch } from '@/lib/admin/backend';
export async function GET(_request: Request, context: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await context.params;
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id))
        return NextResponse.json({ message: '잘못된 이력 식별자입니다.' }, { status: 400 });
    return adminBackendFetch(`/api/admin/security/runs/${encodeURIComponent(id)}`);
}
