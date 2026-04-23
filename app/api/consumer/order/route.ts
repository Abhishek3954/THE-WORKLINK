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

    let imageData = null;
    if (image && typeof image === 'string' && image.includes('base64')) {
      const parts = image.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const buffer = Buffer.from(parts[1], 'base64');
      imageData = { data: buffer, contentType };
    }

    const orderData: any = {
      consumerPhone,
      mainSkill,
      description,
      budget,
      workerType: workerType || 'gig',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(isUrgent && { isUrgent, urgentHours })
    };

    if (imageData) {
      orderData.image = imageData;
    }

    const result = await orders.insertOne(orderData);
    const order = { ...orderData, _id: result.insertedId };

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Order API Error (POST):', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number required' }, { status: 400 });
    }

    const db = await getDb();
    const orders = await db.collection('orders')
      .find({ consumerPhone: phone })
      .sort({ createdAt: -1 })
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
    console.error('Order API Error (GET):', error);
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
    const workerCollection = db.collection('workerdata');

    // Fetch the current order to check for recruitment
    const currentOrder = await orderCollection.findOne({ _id: new ObjectId(id) });
    if (!currentOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (rating !== undefined) updateData.rating = rating;

    // Handle Payment Distribution for progressive payments (Arrival & Completion)
    if ((paymentStatus === 'half' && currentOrder.paymentStatus !== 'half') || 
        (paymentStatus === 'final' && currentOrder.paymentStatus !== 'final')) {
      
      const budget = parseFloat(currentOrder.budget) || 0;
      const instalmentAmount = budget / 2; // Each payment is 50%
      
      const mentorPhone = currentOrder.mentorPhone;
      const rookiePhone = currentOrder.rookiePhone;
      const leadWorkerPhone = currentOrder.workerPhone || currentOrder.acceptedWorkerPhone;

      const addEarnings = async (phone: string, amount: number, type: string) => {
        if (!phone) return;
        await workerCollection.updateOne(
          { phone },
          { 
            $push: { 
              'earnings.bonuses': {
                amount,
                orderId: id,
                type,
                date: new Date(),
                heading: 'Bonus'
              }
            },
            $inc: { 'earnings.balance': amount }
          }
        );
      };

      const stageText = paymentStatus === 'half' ? 'Arrival (50%)' : 'Completion (50%)';

      if (mentorPhone && rookiePhone) {
        // Split CURRENT instalment 80:20
        const mentorShare = instalmentAmount * 0.8;
        const rookieShare = instalmentAmount * 0.2;
        await addEarnings(mentorPhone, mentorShare, `WorkLink ${stageText} Payout (Mentor Share)`);
        await addEarnings(rookiePhone, rookieShare, `WorkLink ${stageText} Payout (Rookie Share)`);
      } else if (leadWorkerPhone) {
        // Regular worker gets full instalment
        await addEarnings(leadWorkerPhone, instalmentAmount, `Gig ${stageText} Payout`);
      }
    }

    const result = await orderCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    const updatedOrder = (result as any).value || result;
    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Order API Error (PUT):', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('orders').findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Order API Error (DELETE):', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
