// ============================================
// app/api/tenants/[tenantId]/route.ts - Update & Delete Tenant
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { getTenantConfig, updateTenant, deleteTenant } from '@/lib/tenantConfig';

export async function GET(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const tenant = await getTenantConfig(params.tenantId);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const body = await req.json();

    // Remove immutable fields to prevent update conflicts
    const { tenantId, _id, createdAt, updatedAt, ...updateData } = body;

    console.log('Updating tenant:', params.tenantId);
    console.log('Update data:', updateData);

    const tenant = await updateTenant(params.tenantId, updateData);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(tenant);
  } catch (error: any) {
    console.error('Error updating tenant:', error);

    // Handle duplicate domain error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A tenant with this domain already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update tenant' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const success = await deleteTenant(params.tenantId);

    if (!success) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    return NextResponse.json(
      { error: 'Failed to delete tenant' },
      { status: 500 }
    );
  }
}
