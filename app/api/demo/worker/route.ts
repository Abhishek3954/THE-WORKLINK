import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const orders = db.collection('orders');
    
    const { workerPhone } = await req.json();

    if (!workerPhone) {
      return NextResponse.json({ success: false, error: 'Missing workerPhone' }, { status: 400 });
    }

    const orderData: any = {
      consumerPhone: '9999999999',
      workerPhone,
      mainSkill: 'Demo Run Service',
      description: 'This is a simulated demo order to showcase the workflow.',
      budget: 500,
      workerType: 'gig',
      status: 'accepted',
      isDemo: true,
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const result = await orders.insertOne(orderData);
    const order = { ...orderData, _id: result.insertedId };

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Demo Worker API Error (POST):', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, status, paymentStatus, rating } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }

    const db = await getDb();
    const orderCollection = db.collection('orders');

    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (rating !== undefined) updateData.rating = rating;

    const result = await orderCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    const updatedOrder = (result as any).value || result;
    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Demo Worker API Error (PUT):', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
