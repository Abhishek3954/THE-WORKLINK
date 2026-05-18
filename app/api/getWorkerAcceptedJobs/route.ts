import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const excludeImages = searchParams.get('excludeImages') === 'true';

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Worker phone required' }, { status: 400 });
    }

    const db = await getDb();
    const projection = excludeImages ? { image: 0 } : {};

    const orders = await db.collection('orders').find({ 
      $or: [
        { workerPhone: phone },
        { mentorPhone: phone },
        { rookiePhone: phone }
      ],
      // Include recruitment_pending so workers can see these in their jobs section
      status: { $in: ['accepted', 'ongoing', 'completed', 'recruitment_pending'] } 
    })
    .project(projection)
    .sort({ updatedAt: -1 })
    .toArray();

    const transformedOrders = orders.map((order: any) => {
      if (order.image && order.image.data) {
        const buffer = order.image.data.buffer || order.image.data;
        const b64 = Buffer.from(buffer).toString('base64');
        order.image = {
          ...order.image,
          data: `data:${order.image.contentType};base64,${b64}`
        };
      }
      return order;
    });

    return NextResponse.json({ success: true, data: transformedOrders });
  } catch (error) {
    console.error('Worker Accepted Jobs Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
