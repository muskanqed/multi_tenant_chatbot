// ============================================
// app/api/debug/rebuild-indexes/route.ts - Rebuild Tenant Indexes
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Tenant from '@/models/Tenant';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const collection = Tenant.collection;

    // Drop all existing indexes except _id
    console.log('Dropping existing indexes...');
    await collection.dropIndexes();

    // Rebuild indexes from schema
    console.log('Rebuilding indexes from schema...');
    await Tenant.createIndexes();

    const indexes = await collection.indexes();

    return NextResponse.json({
      success: true,
      message: 'Indexes rebuilt successfully',
      indexes,
    });
  } catch (error: any) {
    console.error('Rebuild indexes error:', error);
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
