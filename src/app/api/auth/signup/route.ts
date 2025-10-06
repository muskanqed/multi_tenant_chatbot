import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import Tenant from '@/models/Tenant';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, tenantId } = await req.json();

    console.log('=== Signup Request Debug ===');
    console.log('Received tenantId:', tenantId);
    console.log('tenantId type:', typeof tenantId);
    console.log('tenantId value:', JSON.stringify(tenantId));

    // Validation
    if (!name || !email || !password || !tenantId) {
      return NextResponse.json(
        { error: 'Name, email, password, and tenantId are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify tenant exists
    console.log('Searching for tenant with tenantId:', tenantId);
    const tenant = await Tenant.findOne({ tenantId });
    console.log('Found tenant:', tenant ? 'YES' : 'NO');

    if (!tenant) {
      // List all tenants for debugging
      const allTenants = await Tenant.find({}).select('tenantId name domain');
      console.log('All tenants in database:', allTenants);

      return NextResponse.json(
        { error: `Invalid tenant ID: "${tenantId}". Please ensure you're accessing the correct domain.` },
        { status: 404 }
      );
    }

    // Check if user already exists with this email in this tenant
    const existingUser = await User.findOne({ email, tenantId });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists in this tenant' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (all users in DB are tenant users/clients)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      tenantId,
    });

    // Return user without password
    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          tenantId: user.tenantId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
