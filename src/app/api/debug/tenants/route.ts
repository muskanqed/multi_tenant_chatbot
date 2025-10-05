// ============================================
// app/api/debug/tenants/route.ts - Debug Tenant Database
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Tenant from '@/models/Tenant';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get all tenants directly from MongoDB
    const tenants = await Tenant.find({});

    // Get collection info
    const collection = Tenant.collection;
    const indexes = await collection.indexes();

    return NextResponse.json({
      success: true,
      count: tenants.length,
      tenants: tenants.map(t => t.toObject()),
      indexes,
      collectionName: collection.collectionName,
    });
  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
