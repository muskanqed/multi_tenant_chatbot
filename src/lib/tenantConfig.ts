// ============================================
// lib/tenantConfig.ts - Tenant Management
// ============================================
import { connectDB } from './mongoose';
import Tenant, { ITenant } from '@/models/Tenant';

export async function getTenantConfig(tenantId: string): Promise<ITenant | null> {
  try {
    await connectDB();
    const tenant = await Tenant.findOne({ tenantId }).lean();
    return tenant as ITenant | null;
  } catch (error) {
    console.error('Error fetching tenant config:', error);
    return null;
  }
}

export async function getAllTenants(): Promise<ITenant[]> {
  try {
    await connectDB();
    console.log('Fetching all tenants from database...');

    const tenants = await Tenant.find({}).lean();
    console.log(`Found ${tenants.length} tenants:`, tenants);

    return tenants as ITenant[];
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return [];
  }
}

export async function createTenant(data: Partial<ITenant>): Promise<ITenant> {
  try {
    await connectDB();
    console.log('=== Creating tenant ===');
    console.log('Received data:', JSON.stringify(data, null, 2));
    console.log('Domain field:', data.domain);
    console.log('Has domain?', 'domain' in data);

    const tenant = new Tenant(data);
    console.log('Tenant instance created');
    console.log('Instance domain:', tenant.domain);

    const savedTenant = await tenant.save();
    const savedObject = savedTenant.toObject();
    console.log('Tenant saved to database');
    console.log('Saved domain:', savedObject.domain);
    console.log('Full saved tenant:', JSON.stringify(savedObject, null, 2));
    console.log('=== Tenant creation complete ===');

    return savedTenant;
  } catch (error) {
    console.error('Error in createTenant:', error);
    throw error;
  }
}

export async function updateTenant(
  tenantId: string,
  data: Partial<ITenant>
): Promise<ITenant | null> {
  await connectDB();
  const tenant = await Tenant.findOneAndUpdate(
    { tenantId },
    { $set: data },
    { new: true }
  );
  return tenant;
}

export async function deleteTenant(tenantId: string): Promise<boolean> {
  await connectDB();
  const result = await Tenant.deleteOne({ tenantId });
  return result.deletedCount > 0;
}
