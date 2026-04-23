import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const type = searchParams.get('type'); // 'rookie' or 'mentor'
    const city = searchParams.get('city');

    if (!phone || !type) {
      return NextResponse.json({ success: false, error: 'Phone and type are required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('workerdata');

    const currentUser = await collection.findOne({ phone });
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const userRank = currentUser.rank || 5;

    let rankQuery = {};
    if (type === 'rookie') {
      rankQuery = { $lt: userRank };
    } else if (type === 'mentor') {
      rankQuery = { $gt: userRank };
    }

    // Find other employee workers in the same city with the requested rank
    const workers = await collection.find({
      phone: { $ne: phone },
      workerType: 'worklink',
      city: city || currentUser.city,
      rank: rankQuery
    }).toArray();

    const result = workers.map(w => {
      let profileImage = '';
      if (w.profilePic && w.profilePic.data) {
        const buffer = w.profilePic.data.buffer || w.profilePic.data;
        const b64 = Buffer.from(buffer).toString('base64');
        profileImage = `data:${w.profilePic.contentType};base64,${b64}`;
      } else if (typeof w.profilePic === 'string') {
        profileImage = w.profilePic;
      }
      
      return {
        name: w.name,
        phone: w.phone,
        rank: w.rank,
        primarySkill: w.primarySkill,
        profileImage
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Available Workforce Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
