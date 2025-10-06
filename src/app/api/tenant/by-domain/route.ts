// ============================================
// app/api/tenant/by-domain/route.ts - Get Tenant by Domain
// ============================================
import { NextRequest, NextResponse } from "next/server";
import { getTenantByDomain } from "@/lib/tenantConfig";

export async function GET(req: NextRequest) {
  try {
    // Get domain from query parameter or request headers
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain") || req.headers.get("host") || "";

    console.log('=== Tenant By Domain API Debug ===');
    console.log('Requested domain:', domain);

    if (!domain) {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    const tenant = await getTenantByDomain(domain);

    console.log('Found tenant:', tenant ? 'YES' : 'NO');
    if (tenant) {
      console.log('Tenant data:', {
        tenantId: tenant.tenantId,
        name: tenant.name,
        domain: tenant.domain,
      });
    }

    if (!tenant) {
      return NextResponse.json(
        { error: "No tenant found for this domain" },
        { status: 404 }
      );
    }

    // Return only public-facing tenant data (exclude sensitive fields)
    const response = {
      tenantId: tenant.tenantId,
      name: tenant.name,
      domain: tenant.domain,
      logoUrl: tenant.logoUrl,
      themeColor: tenant.themeColor,
      welcomeMessage: tenant.welcomeMessage,
    };

    console.log('Returning tenant response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching tenant by domain:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenant configuration" },
      { status: 500 }
    );
  }
}
