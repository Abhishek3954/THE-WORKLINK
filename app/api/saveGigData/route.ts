import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const collection = db.collection('workerdata');

    const body = await req.json()
    const {
      name,
      phone,
      password,
      primarySkill,
      secondarySkills,
      yearsOfExperience,
      workBackground,
      jobsCompleted,
      toolsAvailability,
      materialHandling,
      workType,
      availability,
      jobPreference,
      travelRange,
      travelWillingness,
      hasVehicle,
      languages,
      paymentPreference,
      expectedDailyIncome,
      idProofType,
      hasWorkPhotos,
      hasCertification,
      jobCommitment,
      cancellationBehavior,
      city,
    } = body

    if (!name || !phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, phone, and password are required' },
        { status: 400 }
      )
    }

    // Check if phone number is already registered as Worker
    const existingWorker = await collection.findOne({ phone });
    if (existingWorker) {
      return NextResponse.json(
        { success: false, error: 'This phone number is already registered as Worker' },
        { status: 409 }
      )
    }

    // Check if phone number is registered as Consumer
    const existingConsumer = await db.collection('consumers').findOne({ phone });
    if (existingConsumer) {
      return NextResponse.json(
        { success: false, error: 'This phone number is already registered as Consumer' },
        { status: 409 }
      )
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')

    const workerRecord = {
      name,
      phone,
      password: hashedPassword,
      primarySkill,
      secondarySkills,
      yearsOfExperience,
      workBackground,
      jobsCompleted,
      toolsAvailability,
      materialHandling,
      workType,
      availability,
      jobPreference,
      travelRange,
      travelWillingness,
      hasVehicle,
      languages,
      paymentPreference,
      expectedDailyIncome,
      idProofType,
      hasWorkPhotos,
      hasCertification,
      jobCommitment,
      jobCommitment,
      cancellationBehavior,
      city: city || 'Ludhiana',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(workerRecord);
    const newSignUp = { ...workerRecord, _id: result.insertedId };

    return NextResponse.json(
      { success: true, data: newSignUp },
      { status: 201 }
    )

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'This phone number is already registered' },
        { status: 409 }
      )
    }
    console.error('saveGigData Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}