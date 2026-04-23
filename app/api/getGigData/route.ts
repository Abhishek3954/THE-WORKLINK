import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const db = await getDb();
    const collection = db.collection('workerdata');

    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const worker: any = await collection.findOne({ phone });

    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      )
    }

    if (worker.profilePic && worker.profilePic.data) {
      const buffer = worker.profilePic.data.buffer || worker.profilePic.data;
      const b64 = Buffer.from(buffer).toString('base64');
      worker.profilePic = `data:${worker.profilePic.contentType};base64,${b64}`;
    } else if (typeof worker.profilePic === 'string' && worker.profilePic.startsWith('data:image')) {
      // Keep legacy string format
    } else {
      worker.profilePic = '';
    }

    return NextResponse.json(
      { success: true, data: worker },
      { status: 200 }
    )

  } catch (error) {
    console.error('getGigData Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
