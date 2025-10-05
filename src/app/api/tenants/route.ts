// ============================================
// app/api/tenants/route.ts - Get All Tenants & Create Tenant
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { getAllTenants, createTenant } from '@/lib/tenantConfig';

export async function GET() {
  try {
    const tenants = await getAllTenants();
    return NextResponse.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body.tenantId || !body.name) {
      return NextResponse.json(
        { error: 'tenantId and name are required' },
        { status: 400 }
      );
    }

    const tenant = await createTenant(body);
    return NextResponse.json(tenant, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tenant:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Tenant with this ID already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}
