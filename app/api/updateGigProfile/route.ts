import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const collection = db.collection('workerdata');

    const body = await req.json()
    const { phone, updates } = body

    if (!phone || !updates) {
      return NextResponse.json(
        { success: false, error: 'Phone and updates are required' },
        { status: 400 }
      )
    }

    let finalUpdates = { ...updates, updatedAt: new Date() }
    
    // Check if phone number is being updated
    if (finalUpdates.phone && finalUpdates.phone !== phone) {
      const workerTaken = await collection.findOne({ phone: finalUpdates.phone });
      if (workerTaken) {
        return NextResponse.json({ success: false, error: 'New phone number is already registered as Worker' }, { status: 409 });
      }

      const consumerTaken = await db.collection('consumers').findOne({ phone: finalUpdates.phone });
      if (consumerTaken) {
        return NextResponse.json({ success: false, error: 'New phone number is already registered as Consumer' }, { status: 409 });
      }
    }
    
    if (finalUpdates.password) {
        finalUpdates.password = crypto.createHash('sha256').update(finalUpdates.password).digest('hex'); 
    }

    if (finalUpdates.profilePic && typeof finalUpdates.profilePic === 'string' && finalUpdates.profilePic.startsWith('data:image')) {
      const matches = finalUpdates.profilePic.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        finalUpdates.profilePic = {
          contentType: matches[1],
          data: Buffer.from(matches[2], 'base64')
        };
      }
    } else {
      delete finalUpdates.profilePic;
    }

    const result = await collection.findOneAndUpdate(
      { phone },
      { $set: finalUpdates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      )
    }

    const updatedWorker = (result as any).value || result;

    if (updatedWorker.profilePic && updatedWorker.profilePic.data) {
      const buffer = updatedWorker.profilePic.data.buffer || updatedWorker.profilePic.data;
      const b64 = Buffer.from(buffer).toString('base64');
      updatedWorker.profilePic = `data:${updatedWorker.profilePic.contentType};base64,${b64}`;
    } else if (typeof updatedWorker.profilePic === 'string' && updatedWorker.profilePic.startsWith('data:image')) {
      // Keep legacy string format
    } else {
      updatedWorker.profilePic = '';
    }

    return NextResponse.json(
      { success: true, data: updatedWorker },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('updateGigProfile Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error: ' + error.message },
      { status: 500 }
    )
  }
}
