import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const db = await getDb();
    const collection = db.collection('workerdata');
    
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone is required' }, { status: 400 })
    }

    const worker: any = await collection.findOne({ phone });
    if (!worker) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 })
    }

    if (worker.profilePic && worker.profilePic.data) {
        const buffer = worker.profilePic.data.buffer || worker.profilePic.data;
        const b64 = Buffer.from(buffer).toString('base64');
        worker.profilePic = `data:${worker.profilePic.contentType};base64,${b64}`;
    }

    return NextResponse.json({ success: true, data: worker })
  } catch (error: any) {
    console.error('WorkLink Profile Error (GET):', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const db = await getDb();
    const collection = db.collection('workerdata');
    
    const body = await req.json()
    const { phone, ...updates } = body

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone is required' }, { status: 400 })
    }

    const result = await collection.findOneAndUpdate(
      { phone },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 404 })
    }

    const updatedWorker = (result as any).value || result;

    return NextResponse.json({ success: true, data: updatedWorker })
  } catch (error: any) {
    console.error('WorkLink Profile Error (PUT):', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
