import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

// POST: Create a recruitment request
export async function POST(req: Request) {
  try {
    const db = await getDb();
    const { orderId, recruiterPhone, recruitedPhone, type } = await req.json();

    if (!orderId || !recruiterPhone || !recruitedPhone || !type) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          recruiterPhone,
          recruitedWorkerPhone: recruitedPhone,
          recruitmentType: type,
          recruitmentStatus: 'pending',
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Recruitment request sent' });
  } catch (error: any) {
    console.error('Workforce Request Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET: Fetch requests for a worker
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone required' }, { status: 400 });
    }

    const db = await getDb();
    
    // Find orders where this worker is being recruited and status is pending
    const requests = await db.collection('orders').aggregate([
      { 
        $match: { 
          recruitedWorkerPhone: phone,
          recruitmentStatus: 'pending'
        } 
      },
      {
        $lookup: {
          from: 'workerdata',
          localField: 'recruiterPhone',
          foreignField: 'phone',
          as: 'recruiterDetails'
        }
      },
      { $unwind: '$recruiterDetails' }
    ]).toArray();

    const result = requests.map(req => {
        let recruiterImage = '';
        const w = req.recruiterDetails;
        if (w.profilePic && w.profilePic.data) {
          const buffer = w.profilePic.data.buffer || w.profilePic.data;
          const b64 = Buffer.from(buffer).toString('base64');
          recruiterImage = `data:${w.profilePic.contentType};base64,${b64}`;
        } else if (typeof w.profilePic === 'string') {
          recruiterImage = w.profilePic;
        }

        return {
          orderId: req._id,
          mainSkill: req.mainSkill,
          budget: req.budget,
          recruiterName: w.name,
          recruiterPhone: w.phone,
          recruiterRank: w.rank,
          recruiterImage,
          type: req.recruitmentType,
          date: req.createdAt
        };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Fetch Workforce Requests Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Accept/Decline a request
export async function PATCH(req: Request) {
  try {
    const db = await getDb();
    const { orderId, status } = await req.json(); // status: 'accepted' or 'declined'

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Order ID and status required' }, { status: 400 });
    }

    const order = await db.collection('orders').findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (status === 'declined') {
      await db.collection('orders').updateOne(
        { _id: new ObjectId(orderId) },
        { 
          $set: { 
            recruitmentStatus: 'declined',
            recruitedWorkerPhone: null,
            updatedAt: new Date()
          } 
        }
      );
      return NextResponse.json({ success: true, message: 'Request declined' });
    }

    // If accepted
    const recruiterPhone = order.recruiterPhone;
    const recruitedPhone = order.recruitedWorkerPhone;

    // Calculate Mentor/Rookie roles based on rank
    const recruiter = await db.collection('workerdata').findOne({ phone: recruiterPhone });
    const recruited = await db.collection('workerdata').findOne({ phone: recruitedPhone });

    let mentorPhone, rookiePhone;
    if (recruiter.rank > recruited.rank) {
      mentorPhone = recruiterPhone;
      rookiePhone = recruitedPhone;
    } else {
      mentorPhone = recruitedPhone;
      rookiePhone = recruiterPhone;
    }

    // Update order status to ongoing/accepted and link both workers
    // Payments will happen in api/consumer/order PUT based on progress (arrived/completed)
    await db.collection('orders').updateOne(
      { _id: new ObjectId(orderId) },
      { 
        $set: { 
          recruitmentStatus: 'accepted',
          status: 'accepted', 
          workerPhone: recruiterPhone, // Original recruiter remains lead
          mentorPhone,
          rookiePhone,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({ success: true, message: 'Request accepted' });
  } catch (error: any) {
    console.error('Handle Workforce Request Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
