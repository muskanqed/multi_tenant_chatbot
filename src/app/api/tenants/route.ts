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

    console.log('Creating tenant with data:', body);

    // Basic validation
    if (!body.tenantId || !body.name || !body.domain) {
      console.error('Validation failed - missing fields:', {
        tenantId: !!body.tenantId,
        name: !!body.name,
        domain: !!body.domain,
      });
      return NextResponse.json(
        { error: 'tenantId, name, and domain are required' },
        { status: 400 }
      );
    }

    const tenant = await createTenant(body);
    console.log('Tenant created successfully:', tenant);
    return NextResponse.json(tenant, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tenant:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = error.message.includes('domain') ? 'domain' : 'tenant ID';
      return NextResponse.json(
        { error: `A tenant with this ${field} already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create tenant' },
      { status: 500 }
    );
  }
}
