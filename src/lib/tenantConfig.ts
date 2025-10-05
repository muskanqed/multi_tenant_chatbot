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
    const tenants = await Tenant.find({}).lean();
    return tenants as ITenant[];
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return [];
  }
}

export async function createTenant(data: Partial<ITenant>): Promise<ITenant> {
  await connectDB();
  const tenant = new Tenant(data);
  await tenant.save();
  return tenant;
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
