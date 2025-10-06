"use client";

import { useEffect } from "react";
import { useTenantBranding } from "@/hooks/useTenantBranding";

/**
 * Dynamic Favicon Component
 *
 * Updates the browser favicon based on tenant branding.
 * Falls back to default favicon if no tenant logo is available.
 *
 * Usage: Add this component to your root layout.tsx
 */
export default function DynamicFavicon() {
  const { branding } = useTenantBranding();

  useEffect(() => {
    if (!branding) return;

    // Get or create favicon link element
    let faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;

    if (!faviconLink) {
      faviconLink = document.createElement("link");
      faviconLink.rel = "icon";
      document.head.appendChild(faviconLink);
    }

    // Update favicon based on tenant branding
    if (branding.logoUrl) {
      // Use tenant logo as favicon
      faviconLink.href = branding.logoUrl;
    } else {
      // Generate a colored favicon with initials or fallback to default
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Draw background
        ctx.fillStyle = branding.themeColor || "#3b82f6";
        ctx.fillRect(0, 0, 64, 64);

        // Draw initial letter
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const initial = branding.name?.charAt(0).toUpperCase() || "M";
        ctx.fillText(initial, 32, 32);

        // Set as favicon
        faviconLink.href = canvas.toDataURL("image/png");
      }
    }

    // Also update apple-touch-icon if it exists
    let appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (appleTouchIcon && branding.logoUrl) {
      appleTouchIcon.href = branding.logoUrl;
    }

    // Update document title with tenant name
    if (branding.name && !document.title.includes(branding.name)) {
      document.title = branding.name;
    }
  }, [branding]);

  // This component doesn't render anything
  return null;
}
