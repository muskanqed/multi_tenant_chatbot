import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import Tenant from '@/models/Tenant';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, tenantId } = await req.json();

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
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return NextResponse.json(
        { error: 'Invalid tenant ID' },
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
