# Debug "Invalid Tenant ID" Error

## 🔍 How to Debug

I've added comprehensive debugging logs. Follow these steps:

### **Step 1: Open Your Browser Console**

1. Open browser DevTools (F12 or right-click → Inspect)
2. Go to the **Console** tab
3. Navigate to `/auth/signup`

### **Step 2: Check Client-Side Logs**

You should see logs like this in the **browser console**:

```
=== Signup Client Debug ===
branding object: {
  tenantId: "acme",
  name: "Acme Corporation",
  domain: "localhost",
  logoUrl: "...",
  themeColor: "#ff6b35",
  welcomeMessage: "..."
}
Sending tenantId: "acme"
Full signup data: {
  name: "John Doe",
  email: "john@example.com",
  password: "******",
  tenantId: "acme"
}
```

**Check:**
- ✅ Is `branding.tenantId` present?
- ✅ Is it a string (not null/undefined)?
- ✅ Does it match the tenant you created?

### **Step 3: Check Server-Side Logs**

Look at your **terminal/console** where you ran `npm run dev`. You should see:

#### **3a. Tenant by Domain API Logs:**
```
=== Tenant By Domain API Debug ===
Requested domain: localhost
Found tenant: YES
Tenant data: {
  tenantId: "acme",
  name: "Acme Corporation",
  domain: "localhost"
}
Returning tenant response: { tenantId: "acme", ... }
```

**Check:**
- ✅ Is the domain correct?
- ✅ Was tenant found?
- ✅ Is `tenantId` returned?

#### **3b. Signup API Logs:**
```
=== Signup Request Debug ===
Received tenantId: "acme"
tenantId type: string
tenantId value: "acme"
Searching for tenant with tenantId: acme
Found tenant: YES
```

**If you see:**
```
Found tenant: NO
All tenants in database: [
  { tenantId: "some-other-id", name: "...", domain: "..." }
]
```

This means the tenantId doesn't match what's in your database!

---

## 🐛 Common Issues & Solutions

### **Issue 1: No Tenant Found for Domain**

**Symptom:**
```
=== Tenant By Domain API Debug ===
Requested domain: localhost
Found tenant: NO
```

**Solution:**
You need to create a tenant with `domain: "localhost"` in your database.

```bash
# Use the admin panel at /admin or create via API:
POST http://localhost:3000/api/tenants
Content-Type: application/json

{
  "tenantId": "my-company",
  "name": "My Company",
  "domain": "localhost",
  "themeColor": "#3b82f6",
  "welcomeMessage": "Welcome!",
  "aiPersona": "You are a helpful assistant.",
  "model": "gemini-2.5-pro"
}
```

**IMPORTANT:** The `domain` field must match your hostname:
- If accessing via `http://localhost:3000` → use `"domain": "localhost"`
- If accessing via `http://127.0.0.1:3000` → use `"domain": "127.0.0.1"`
- If accessing via `http://myapp.local` → use `"domain": "myapp.local"`

---

### **Issue 2: TenantID Mismatch (Case Sensitivity)**

**Symptom:**
```
Received tenantId: "MyCompany"
Searching for tenant with tenantId: MyCompany
Found tenant: NO
All tenants in database: [
  { tenantId: "mycompany", ... }
]
```

**Cause:**
The `tenantId` field has `lowercase: true` in the schema. When you create a tenant with `tenantId: "MyCompany"`, it gets saved as `"mycompany"`.

**Solution:**
Always use lowercase for `tenantId` when creating tenants:

```json
{
  "tenantId": "mycompany",  // ✅ lowercase
  "name": "My Company",     // ✅ can have uppercase
  ...
}
```

---

### **Issue 3: Wrong Domain in Tenant Config**

**Symptom:**
- You created a tenant with `domain: "example.com"`
- But you're accessing `http://localhost:3000`
- API returns "No tenant found for this domain"

**Solution:**
Either:
1. **Update the tenant's domain:**
```bash
PUT http://localhost:3000/api/tenants/your-tenant-id
{
  "domain": "localhost"
}
```

2. **Or access via the configured domain** (requires hosts file setup)

---

### **Issue 4: Multiple Tenants, Wrong Domain Match**

**Symptom:**
```
All tenants in database: [
  { tenantId: "tenant-a", domain: "app1.com" },
  { tenantId: "tenant-b", domain: "app2.com" },
  { tenantId: "tenant-c", domain: "localhost" }
]
```

You have multiple tenants but accessing the wrong domain.

**Solution:**
Make sure your current hostname matches one of the tenant domains.

---

## 🔧 Quick Fix Steps

### **Step 1: Check Your Current Domain**

Open browser console and run:
```javascript
console.log(window.location.hostname);
// Output: "localhost" or "127.0.0.1" or "myapp.local"
```

### **Step 2: List All Tenants**

```bash
GET http://localhost:3000/api/tenants
```

Look for a tenant with matching `domain` field.

### **Step 3: Create or Update Tenant**

**If no tenant exists with your domain:**
```bash
POST http://localhost:3000/api/tenants
{
  "tenantId": "test-tenant",
  "name": "Test Company",
  "domain": "localhost",  // ← Use your hostname here
  "themeColor": "#3b82f6",
  "welcomeMessage": "Welcome!",
  "aiPersona": "You are a helpful assistant.",
  "model": "gemini-2.5-pro"
}
```

**If tenant exists but wrong domain:**
```bash
PUT http://localhost:3000/api/tenants/test-tenant
{
  "domain": "localhost"  // ← Update to match your hostname
}
```

### **Step 4: Clear Cache & Reload**

After creating/updating the tenant:

```javascript
// In browser console:
localStorage.removeItem('tenant_branding');
window.location.reload();
```

---

## 📊 Full Debug Checklist

Use this to trace the flow:

```
[ ] 1. Visit /auth/signup
[ ] 2. Check browser console for "=== Signup Client Debug ==="
[ ] 3. Verify branding.tenantId is present
[ ] 4. Check terminal for "=== Tenant By Domain API Debug ==="
[ ] 5. Verify domain matches your hostname
[ ] 6. Verify tenant was found
[ ] 7. Fill signup form and submit
[ ] 8. Check browser console for signup data being sent
[ ] 9. Check terminal for "=== Signup Request Debug ==="
[ ] 10. Verify received tenantId matches database tenantId
[ ] 11. Check "All tenants in database" if lookup fails
```

---

## 🎯 Most Likely Solution

**99% of the time, the issue is:**

You're accessing `http://localhost:3000` but your tenant has a different domain (or no tenant exists with `domain: "localhost"`).

**Fix:**
```bash
# Create a tenant with the correct domain
POST /api/tenants
{
  "tenantId": "local-dev",
  "name": "Local Development",
  "domain": "localhost",  # ← This must match window.location.hostname
  "themeColor": "#3b82f6"
}
```

Then refresh the signup page.

---

## 📞 Still Having Issues?

Run this in your browser console and share the output:

```javascript
// Check what's being fetched
fetch('/api/tenant/by-domain?domain=' + window.location.hostname)
  .then(r => r.json())
  .then(data => console.log('Tenant API Response:', data));

// Check current hostname
console.log('Current hostname:', window.location.hostname);

// Check cached branding
console.log('Cached branding:', localStorage.getItem('tenant_branding'));
```

And check your server terminal for the debug logs!
