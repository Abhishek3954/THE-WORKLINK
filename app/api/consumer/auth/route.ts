import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    
    console.log(`Consumer Auth POST action: ${action}`);
    
    const db = await getDb();
    const consumers = db.collection('consumers');

    let data;
    try {
      data = await req.json();
    } catch (e) {
      console.error('Consumer API Error: Failed to parse JSON body');
      return NextResponse.json({ success: false, error: 'Invalid or missing JSON body' }, { status: 400 });
    }

    if (action === 'signup') {
      const { fullName, phone, city, password } = data;
      
      if (!fullName || !phone || !city || !password) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
      }

      const existingConsumer = await consumers.findOne({ phone });
      if (existingConsumer) {
        return NextResponse.json({ success: false, error: 'Phone number already registered as Consumer' }, { status: 400 });
      }

      // Check if phone number is registered as Worker
      const existingWorker = await db.collection('workerdata').findOne({ phone });
      if (existingWorker) {
        return NextResponse.json({ success: false, error: 'This phone number is already registered as Worker' }, { status: 400 });
      }

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      const result = await consumers.insertOne({
        fullName,
        phone,
        city,
        password: hashedPassword,
        profileImage: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('New consumer registered:', phone);
      return NextResponse.json({ success: true, data: { fullName, phone, city, profileImage: '' } });
    }

    if (action === 'signin') {
      const { phone, password } = data;
      
      const consumer = await consumers.findOne({ phone });
      if (!consumer) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      if (consumer.password !== hashedPassword) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
      }

      return NextResponse.json({ success: true, data: { fullName: consumer.fullName, phone: consumer.phone, city: consumer.city, profileImage: consumer.profileImage } });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Consumer API Error (POST):', error);
    
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: 'Phone number already registered' }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
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
    const consumer = await db.collection('consumers').findOne({ phone });
    
    if (!consumer) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (consumer.password) delete consumer.password;

    return NextResponse.json({ success: true, data: consumer });
  } catch (error: any) {
    console.error('Consumer API Error (GET):', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const db = await getDb();
    const consumers = db.collection('consumers');
    
    let data;
    try {
      data = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid or missing JSON body' }, { status: 400 });
    }
    
    if (action === 'updateProfile') {
      const { currentPhone, fullName, phone, city, profileImage } = data;
      
      const updateData: any = { updatedAt: new Date() };
      if (fullName) updateData.fullName = fullName;
      if (city) updateData.city = city;
      if (profileImage !== undefined) updateData.profileImage = profileImage;

      if (phone && phone !== currentPhone) {
        const phoneTaken = await consumers.findOne({ phone });
        if (phoneTaken) {
          return NextResponse.json({ success: false, error: 'New phone number is already registered as Consumer' }, { status: 400 });
        }
        
        const workerTaken = await db.collection('workerdata').findOne({ phone });
        if (workerTaken) {
          return NextResponse.json({ success: false, error: 'New phone number is already registered as Worker' }, { status: 400 });
        }
        updateData.phone = phone;
      }

      const result = await consumers.findOneAndUpdate(
        { phone: currentPhone },
        { $set: updateData },
        { returnDocument: 'after' }
      );

      if (!result) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      // In some versions of the driver, result is a ModifyResult with .value
      const updatedConsumer = (result as any).value || result;

      return NextResponse.json({ 
        success: true, 
        message: 'Profile updated successfully', 
        data: { 
          fullName: updatedConsumer.fullName, 
          phone: updatedConsumer.phone, 
          city: updatedConsumer.city, 
          profileImage: updatedConsumer.profileImage 
        } 
      });
    }

    if (action === 'changePassword') {
      const { phone, oldPassword, newPassword } = data;

      const consumer = await consumers.findOne({ phone });
      if (!consumer) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      const hashedOldPassword = crypto.createHash('sha256').update(oldPassword).digest('hex');

      if (consumer.password !== hashedOldPassword) {
        return NextResponse.json({ success: false, error: 'Incorrect old password' }, { status: 401 });
      }

      const hashedNewPassword = crypto.createHash('sha256').update(newPassword).digest('hex');
      
      await consumers.updateOne(
        { phone },
        { $set: { password: hashedNewPassword, updatedAt: new Date() } }
      );

      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Consumer API Error (PUT):', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}