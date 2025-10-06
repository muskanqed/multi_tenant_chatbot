# Multi-Tenant Branding Implementation

This document describes the dynamic tenant branding system that allows each tenant to have their own logo, favicon, and theme colors on authentication pages and throughout the application.

## Features

✅ **Dynamic Tenant Detection** - Automatically detects tenant based on domain
✅ **Custom Logos** - Displays tenant logo on sign in/sign up pages
✅ **Dynamic Favicon** - Updates browser favicon based on tenant branding
✅ **Theme Colors** - Applies tenant theme colors to branding elements
✅ **Client-Side Caching** - Caches tenant branding for 30 minutes to reduce API calls
✅ **Fallback Handling** - Gracefully handles missing logos and configurations
✅ **Auto-Population** - Automatically sets tenantId in signup form based on domain

## Architecture

### 1. Backend - Tenant Detection

**File:** `src/lib/tenantConfig.ts`

Added `getTenantByDomain()` function that:
- Accepts a domain name (e.g., "example.com" or "localhost:3000")
- Normalizes the domain (removes www., protocol, port, trailing slash)
- Queries MongoDB for matching tenant
- Returns tenant configuration or null

```typescript
export async function getTenantByDomain(domain: string): Promise<ITenant | null>
```

### 2. API Route - Tenant Branding Endpoint

**File:** `src/app/api/tenant/by-domain/route.ts`

GET endpoint that:
- Accepts `domain` query parameter or uses request host header
- Calls `getTenantByDomain()` to fetch tenant config
- Returns public-facing tenant data (tenantId, name, domain, logoUrl, themeColor, welcomeMessage)
- Returns default configuration if no tenant found

**Usage:**
```bash
GET /api/tenant/by-domain?domain=example.com
```

**Response:**
```json
{
  "tenantId": "acme-corp",
  "name": "Acme Corporation",
  "domain": "example.com",
  "logoUrl": "data:image/png;base64,...",
  "themeColor": "#ff6b35",
  "welcomeMessage": "Welcome to Acme Corp!"
}
```

### 3. Client Hook - useTenantBranding

**File:** `src/hooks/useTenantBranding.ts`

React hook that:
- Fetches tenant branding from API on component mount
- Implements localStorage caching (30-minute TTL)
- Provides loading and error states
- Includes `clearCache()` function for manual cache invalidation

**Usage:**
```typescript
const { branding, loading, error, clearCache } = useTenantBranding();

// Access tenant data
console.log(branding?.name);        // "Acme Corporation"
console.log(branding?.logoUrl);     // Base64 logo or URL
console.log(branding?.themeColor);  // "#ff6b35"
```

### 4. Dynamic Favicon Component

**File:** `src/components/DynamicFavicon.tsx`

Client component that:
- Uses `useTenantBranding()` hook
- Updates `<link rel="icon">` element dynamically
- Generates canvas-based favicon if no logo available (uses theme color + tenant initial)
- Updates document title with tenant name
- Updates apple-touch-icon if present

**Integrated in:** `src/app/layout.tsx`

### 5. Updated Authentication Pages

**Files:** `src/app/auth/signin/page.tsx`, `src/app/auth/signup/page.tsx`

Both pages now:
- Use `useTenantBranding()` hook
- Display tenant logo (or colored icon with Sparkles as fallback)
- Show skeleton loader while fetching branding
- Display tenant name in welcome message
- Auto-populate tenantId in signup form (signup only)

## How It Works - User Flow

1. **User visits sign in page** (e.g., `https://tenant1.example.com/auth/signin`)
2. **useTenantBranding hook triggers:**
   - Checks localStorage cache for existing branding data
   - If cache miss or expired, calls `/api/tenant/by-domain?domain=tenant1.example.com`
3. **API route processes request:**
   - Normalizes domain to "tenant1.example.com"
   - Queries MongoDB: `Tenant.findOne({ domain: "tenant1.example.com" })`
   - Returns tenant branding data
4. **Client receives branding:**
   - Caches in localStorage with timestamp
   - Updates page to show tenant logo
   - DynamicFavicon component updates browser favicon
5. **User sees customized login page** with tenant's logo, colors, and branding

## Configuration

### Setting Up a Tenant

1. Create tenant via Admin UI or API:

```json
POST /api/tenants
{
  "tenantId": "acme-corp",
  "name": "Acme Corporation",
  "domain": "acme.example.com",
  "logoUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "themeColor": "#ff6b35",
  "welcomeMessage": "Welcome to Acme!",
  "aiPersona": "You are Acme's helpful assistant.",
  "model": "gemini-2.5-pro"
}
```

2. Configure DNS to point `acme.example.com` to your application
3. Users visiting `acme.example.com/auth/signin` will see Acme branding

### Logo Requirements

- **Format:** Base64-encoded string or URL
- **Recommended Size:** 200x64px (auto-scaled if different)
- **File Types:** PNG, JPG, GIF (PNG recommended for transparency)
- **Max Size:** 2MB

To convert logo to base64:
```javascript
// In browser console or admin UI
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const reader = new FileReader();
reader.onload = (e) => console.log(e.target.result);
reader.readAsDataURL(file);
```

### Domain Normalization

The system normalizes domains to match tenant configurations:

| Input Domain | Normalized Domain |
|-------------|------------------|
| `https://www.example.com` | `example.com` |
| `http://example.com/` | `example.com` |
| `localhost:3000` | `localhost` |
| `sub.example.com:8080` | `sub.example.com` |

## Best Practices

### 1. Caching Strategy

**Client-Side Cache (30 minutes):**
- Reduces API calls
- Improves page load performance
- Automatically refreshes after 30 minutes

**When to clear cache:**
```typescript
// After admin updates tenant branding
const { clearCache } = useTenantBranding();
clearCache();
window.location.reload(); // Refresh to fetch new branding
```

### 2. Fallback Handling

**Missing Logo:**
- Shows colored icon with Sparkles symbol
- Uses tenant's theme color as background

**Missing Tenant:**
- Returns default branding configuration
- Uses blue theme (#3b82f6)
- Shows "Multi-Tenant Chatbot" name

**Network Error:**
- Falls back to default branding
- Logs error to console
- Continues with graceful degradation

### 3. Performance Optimization

✅ **Use Base64 for logos** - Eliminates additional HTTP requests
✅ **Implement caching** - 30-minute client-side cache reduces database queries
✅ **Lazy load branding** - Only fetch when needed, show skeleton while loading
✅ **Memoize components** - Prevent unnecessary re-renders

### 4. Security Considerations

✅ **Public data only** - API route only returns non-sensitive tenant fields
✅ **Domain validation** - Normalize and sanitize domain inputs
✅ **XSS protection** - Next.js Image component handles image security
✅ **CORS headers** - API routes use Next.js built-in CORS handling

## Troubleshooting

### Logo not displaying

**Check:**
1. Logo URL is valid base64 or accessible URL
2. Image format is supported (PNG/JPG/GIF)
3. Base64 string includes proper data URI prefix: `data:image/png;base64,...`
4. Network tab shows successful API response

**Debug:**
```typescript
const { branding } = useTenantBranding();
console.log('Logo URL:', branding?.logoUrl);
console.log('Logo length:', branding?.logoUrl?.length);
```

### Favicon not updating

**Solutions:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for errors
4. Verify DynamicFavicon component is in layout.tsx

### Wrong tenant detected

**Check:**
1. Domain in tenant database matches current hostname
2. Domain normalization is working correctly
3. DNS/hosts file configuration is correct

**Debug:**
```typescript
console.log('Current hostname:', window.location.hostname);
// Should match tenant.domain in database
```

### Cache not updating after tenant change

**Solution:**
```typescript
// Clear localStorage cache
localStorage.removeItem('tenant_branding');
window.location.reload();
```

## API Reference

### GET /api/tenant/by-domain

Fetch tenant branding by domain.

**Query Parameters:**
- `domain` (optional) - Domain to lookup. Defaults to request host header.

**Response:**
```typescript
{
  tenantId: string;
  name: string;
  domain: string;
  logoUrl: string;
  themeColor: string;
  welcomeMessage: string;
}
```

**Example:**
```bash
curl "http://localhost:3000/api/tenant/by-domain?domain=example.com"
```

### Hook: useTenantBranding()

**Returns:**
```typescript
{
  branding: TenantBranding | null;
  loading: boolean;
  error: string | null;
  clearCache: () => void;
}
```

**Example:**
```typescript
const { branding, loading, error, clearCache } = useTenantBranding();

if (loading) return <Skeleton />;
if (error) return <DefaultBranding />;
return <Logo src={branding.logoUrl} />;
```

## Future Enhancements

Potential improvements to consider:

- [ ] Server-side favicon generation using Edge Functions
- [ ] CDN integration for logo hosting
- [ ] Progressive Web App (PWA) manifest with tenant branding
- [ ] Dynamic theme color injection into CSS variables
- [ ] Multi-language support for welcomeMessage
- [ ] A/B testing for different branding variations
- [ ] Analytics for branding effectiveness
- [ ] Automatic logo optimization and format conversion

## Summary

The multi-tenant branding system provides a seamless white-label experience:

✅ **Automatic** - Detects tenant from domain
✅ **Fast** - Client-side caching for performance
✅ **Resilient** - Graceful fallbacks for missing data
✅ **Flexible** - Easy to customize and extend

All files are properly integrated and ready to use. Simply configure your tenant's domain and logo in the database, and the branding will automatically apply across the application.
