import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Worker phone required' }, { status: 400 });
    }

    const db = await getDb();
    const worker: any = await db.collection('workerdata').findOne({ phone });

    if (!worker) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
    }

    // Sanitize data: remove sensitive info like password
    const { password: _, ...safeData } = worker as any;

    if (safeData.profilePic && safeData.profilePic.data) {
      const buffer = safeData.profilePic.data.buffer || safeData.profilePic.data;
      const b64 = Buffer.from(buffer).toString('base64');
      safeData.profilePic = {
        ...safeData.profilePic,
        data: `data:${safeData.profilePic.contentType};base64,${b64}`
      };
    }

    return NextResponse.json({ success: true, data: safeData });
  } catch (error) {
    console.error('Worker Details API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
