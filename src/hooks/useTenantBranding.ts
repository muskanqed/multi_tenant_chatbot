// ============================================
// hooks/useTenantBranding.ts - Tenant Branding Hook
// ============================================
"use client";

import { useEffect, useState } from "react";

export interface TenantBranding {
  tenantId: string;
  name: string;
  domain: string;
  logoUrl: string;
  themeColor: string;
  welcomeMessage: string;
}

const CACHE_KEY = "tenant_branding";
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

/**
 * Hook to fetch and cache tenant branding based on current domain
 * Includes client-side caching with localStorage to minimize API calls
 */
export function useTenantBranding() {
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTenantBranding() {
      try {
        setLoading(true);

        // Check localStorage cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            // Use cached data if still fresh
            if (age < CACHE_DURATION) {
              setBranding(data);
              setLoading(false);
              return;
            }
          } catch (e) {
            // Invalid cache, continue to fetch
            localStorage.removeItem(CACHE_KEY);
          }
        }

        // Fetch from API
        const domain = window.location.hostname;
        const response = await fetch(`/api/tenant/by-domain?domain=${domain}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("No tenant configured for this domain. Please contact your administrator.");
          }
          throw new Error("Failed to fetch tenant branding");
        }

        const data: TenantBranding = await response.json();
        setBranding(data);

        // Cache the result
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );

        setError(null);
      } catch (err) {
        console.error("Error fetching tenant branding:", err);
        setError(err instanceof Error ? err.message : "Unknown error");

        // Don't set default branding - let components handle the error state
        setBranding(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTenantBranding();
  }, []);

  /**
   * Clear cached branding (useful after tenant updates)
   */
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  return { branding, loading, error, clearCache };
}
