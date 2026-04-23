import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PATCH(req: Request) {
  try {
    const db = await getDb();
    const collection = db.collection('workerdata');
    
    const { phone, workerType } = await req.json()

    if (!phone || !workerType) {
      return NextResponse.json({ success: false, error: 'Phone and role are required' }, { status: 400 })
    }

    const result = await collection.findOneAndUpdate(
      { phone },
      { $set: { workerType, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 })
    }

    const updatedWorker = (result as any).value || result;

    return NextResponse.json({ success: true, data: updatedWorker })
  } catch (error: any) {
    console.error('Worker Role API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
