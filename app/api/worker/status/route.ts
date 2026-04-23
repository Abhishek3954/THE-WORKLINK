import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(req: Request) {
  try {
    const db = await getDb();
    const collection = db.collection('workerdata');
    
    const { phone, isOnline } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number required' }, { status: 400 });
    }

    const result = await collection.findOneAndUpdate(
      { phone },
      { $set: { isOnline, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 });
    }

    const worker = (result as any).value || result;

    return NextResponse.json({ success: true, isOnline: worker.isOnline });
  } catch (error) {
    console.error('Worker Status API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}