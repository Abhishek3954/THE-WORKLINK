import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const orders = db.collection('orders');
    
    const { consumerPhone, mainSkill, description, budget, image, workerType, isUrgent, urgentHours } = await req.json();

    if (!consumerPhone || !mainSkill || !description || !budget) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const orderData: any = {
      consumerPhone,
      workerPhone: '9999999999',
      mainSkill: `[Demo] ${mainSkill}`,
      description: description,
      budget: budget,
      workerType: workerType || 'gig',
      status: 'accepted',
      isDemo: true,
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      ...(isUrgent && { isUrgent, urgentHours })
    };

    if (image && typeof image === 'string' && image.includes('base64')) {
      const parts = image.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const buffer = Buffer.from(parts[1], 'base64');
      orderData.image = { data: buffer, contentType };
    }

    const result = await orders.insertOne(orderData);
    const order = { ...orderData, _id: result.insertedId };

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Demo Consumer API Error (POST):', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
