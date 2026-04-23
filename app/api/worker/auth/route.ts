import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const collection = db.collection('workerdata');
    
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json({ success: false, error: 'Phone and password are required' }, { status: 400 });
    }

    const worker: any = await collection.findOne({ phone });
    if (!worker) {
      return NextResponse.json({ success: false, error: 'Worker not found' }, { status: 403 }); // Changed from 404 to be more standard for auth
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Support both hashed and plain text passwords (for legacy/testing)
    if (worker.password !== hashedPassword && worker.password !== password) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    let profilePic = '';
    if (worker.profilePic) {
      if (worker.profilePic.data) {
        try {
          // Native MongoDB driver returns Binary objects which have a .buffer property
          const bufferContent = worker.profilePic.data.buffer || worker.profilePic.data;
          const b64 = Buffer.from(bufferContent).toString('base64');
          profilePic = `data:${worker.profilePic.contentType || 'image/jpeg'};base64,${b64}`;
        } catch (err) {
          console.error('Error processing profile pic:', err);
          // Fallback to existing profilePic if it's already a string or just empty
          profilePic = typeof worker.profilePic === 'string' ? worker.profilePic : '';
        }
      } else if (typeof worker.profilePic === 'string') {
        profilePic = worker.profilePic;
      }
    }

    // Success - return user data
    return NextResponse.json({ 
      success: true, 
      data: {
        name: worker.name,
        phone: worker.phone,
        workerType: worker.workerType || 'gig',
        profileImage: profilePic,
        gigProfile: {
          primarySkill: worker.primarySkill,
          secondarySkills: worker.secondarySkills,
          yearsOfExperience: worker.yearsOfExperience,
          workBackground: worker.workBackground,
          jobsCompleted: worker.jobsCompleted,
          toolsAvailability: worker.toolsAvailability,
          materialHandling: worker.materialHandling,
          workType: worker.workType,
          availability: worker.availability,
          jobPreference: worker.jobPreference,
          travelRange: worker.travelRange,
          travelWillingness: worker.travelWillingness,
          hasVehicle: worker.hasVehicle,
          languages: worker.languages,
          paymentPreference: worker.paymentPreference,
          expectedDailyIncome: worker.expectedDailyIncome,
          idProofType: worker.idProofType,
          hasWorkPhotos: worker.hasWorkPhotos,
          hasCertification: worker.hasCertification,
          jobCommitment: worker.jobCommitment,
          cancellationBehavior: worker.cancellationBehavior,
        }
      } 
    });

  } catch (error: any) {
    console.error('Worker Auth Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
