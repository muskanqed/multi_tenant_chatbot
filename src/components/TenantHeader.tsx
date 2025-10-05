"use client";

import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TenantHeaderProps {
  tenantName: string;
  logo?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export default function TenantHeader({ tenantName, logo, theme }: TenantHeaderProps) {
  return (
    <Card
      className="w-full p-6 mb-6"
      style={theme?.primaryColor ? {
        borderTop: `4px solid ${theme.primaryColor}`
      } : {}}
    >
      <div className="flex items-center gap-4">
        {logo ? (
          <img
            src={logo}
            alt={`${tenantName} logo`}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: theme?.primaryColor || "#3b82f6" }}
          >
            <Building2 className="h-6 w-6 text-white" />
          </div>
        )}

        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: theme?.primaryColor }}
          >
            {tenantName}
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-Powered Support Assistant
          </p>
        </div>
      </div>
    </Card>
  );
}
