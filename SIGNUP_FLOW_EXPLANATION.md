# Signup Flow - TenantID from Domain

## 🎯 The Simple Answer

**YES, we ARE fetching the tenantId from the domain name when the page loads!**

Here's exactly how it works:

---

## 📊 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  User Visits: https://acme.example.com/auth/signup          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Page Component Mounts                              │
│  ─────────────────────────────────────────────────────────  │
│  const { branding } = useTenantBranding();                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Hook Automatically Fetches Tenant                  │
│  ─────────────────────────────────────────────────────────  │
│  const domain = window.location.hostname;                   │
│  // domain = "acme.example.com"                             │
│                                                              │
│  fetch(`/api/tenant/by-domain?domain=${domain}`)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: API Queries Database                               │
│  ─────────────────────────────────────────────────────────  │
│  GET /api/tenant/by-domain?domain=acme.example.com          │
│                                                              │
│  Server executes:                                            │
│  const tenant = await Tenant.findOne({                      │
│    domain: "acme.example.com"                               │
│  });                                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Returns Tenant Data                                │
│  ─────────────────────────────────────────────────────────  │
│  Response: {                                                 │
│    tenantId: "acme",                                         │
│    name: "Acme Corporation",                                │
│    domain: "acme.example.com",                              │
│    logoUrl: "data:image/png;base64...",                     │
│    themeColor: "#ff6b35",                                   │
│    welcomeMessage: "Welcome to Acme!"                        │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Hook Stores Data in 'branding' State              │
│  ─────────────────────────────────────────────────────────  │
│  setBranding({                                               │
│    tenantId: "acme",  // ← This is what we need!           │
│    name: "Acme Corporation",                                │
│    ...                                                       │
│  });                                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 6: Page Displays Tenant Branding                      │
│  ─────────────────────────────────────────────────────────  │
│  - Shows Acme logo                                           │
│  - Displays "Join Acme Corporation to get started"          │
│  - Applies theme color #ff6b35                              │
│  - tenantId is ready: branding.tenantId = "acme"           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 7: User Fills Form & Submits                          │
│  ─────────────────────────────────────────────────────────  │
│  User enters:                                                │
│  - Name: "John Doe"                                          │
│  - Email: "john@acme.com"                                    │
│  - Password: "******"                                        │
│                                                              │
│  Clicks "Sign Up"                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 8: Form Submit Handler                                │
│  ─────────────────────────────────────────────────────────  │
│  const handleSubmit = async (e) => {                        │
│    // Validate tenant exists                                │
│    if (!branding?.tenantId) {                               │
│      setError("Unable to determine tenant");                │
│      return;                                                 │
│    }                                                         │
│                                                              │
│    // Send signup request with auto-detected tenantId       │
│    await fetch("/api/auth/signup", {                        │
│      method: "POST",                                         │
│      body: JSON.stringify({                                 │
│        name: formData.name,                                 │
│        email: formData.email,                               │
│        password: formData.password,                         │
│        tenantId: branding.tenantId  // ← From domain!      │
│      })                                                      │
│    });                                                       │
│  }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 9: Server Creates User                                │
│  ─────────────────────────────────────────────────────────  │
│  POST /api/auth/signup                                       │
│  Body: {                                                     │
│    name: "John Doe",                                         │
│    email: "john@acme.com",                                   │
│    password: "******",                                       │
│    tenantId: "acme"  // ← Automatically detected!          │
│  }                                                           │
│                                                              │
│  Server creates user in database with tenantId = "acme"     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Points

### ✅ **We ARE Fetching TenantID from Domain**

1. **When:** As soon as the signup page loads
2. **How:** Via the `useTenantBranding()` hook
3. **Where:** `src/hooks/useTenantBranding.ts`
4. **Result:** `branding.tenantId` is automatically set

### ✅ **User Never Sees TenantID Field**

- No manual input required
- No hidden form field needed
- User only fills: Name, Email, Password

### ✅ **Domain → TenantID Mapping**

| User Visits | Domain Detected | TenantID Used |
|------------|----------------|---------------|
| `https://acme.example.com/auth/signup` | `acme.example.com` | `"acme"` |
| `https://contoso.com/auth/signup` | `contoso.com` | `"contoso"` |
| `http://localhost:3000/auth/signup` | `localhost` | (tenant with domain "localhost") |

---

## 🎨 Simplified Code Flow

### **Before (Complicated):**
```typescript
// ❌ Unnecessarily complex
const [formData, setFormData] = useState({
  name: "",
  email: "",
  tenantId: "",  // Why store this?
});

useEffect(() => {
  // Copying branding.tenantId to formData.tenantId
  if (branding?.tenantId) {
    setFormData(prev => ({ ...prev, tenantId: branding.tenantId }));
  }
}, [branding]);

// Submit with formData.tenantId
tenantId: formData.tenantId
```

### **After (Clean):**
```typescript
// ✅ Simple and direct
const [formData, setFormData] = useState({
  name: "",
  email: "",
  // No tenantId in state!
});

// No useEffect needed!

// Submit with branding.tenantId directly
tenantId: branding.tenantId  // Already fetched from domain
```

---

## 🚀 Why This Approach is Better

### **1. No Duplicate State**
- `branding.tenantId` already has the value
- No need to copy it to `formData.tenantId`

### **2. No useEffect Synchronization**
- Removed complexity
- Fewer re-renders
- Easier to understand

### **3. Single Source of Truth**
- `branding` is the only place that holds tenant data
- Less chance of bugs from stale state

### **4. Clearer Intent**
```typescript
// Code clearly shows: "We're using the tenant from the domain"
tenantId: branding.tenantId
```

---

## 📝 Complete Code Example

```typescript
export default function SignUpPage() {
  // Fetch tenant data from domain (happens automatically)
  const { branding, loading, error } = useTenantBranding();

  // User form data (NO tenantId here!)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate tenant was detected from domain
    if (!branding?.tenantId) {
      setError("Unable to determine tenant from domain");
      return;
    }

    // Create user with auto-detected tenantId
    await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        ...formData,
        tenantId: branding.tenantId, // From domain!
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input name="name" value={formData.name} />
      <Input name="email" value={formData.email} />
      <Input name="password" value={formData.password} />
      {/* NO tenantId input field! */}
      <Button type="submit">Sign Up</Button>
    </form>
  );
}
```

---

## 🛡️ Security & Validation

### **Client-Side Validation:**
```typescript
if (!branding?.tenantId) {
  setError("Unable to determine tenant. Please access the correct domain.");
  return; // Prevent signup
}
```

### **Server-Side Validation:**
The server should also validate that the tenantId exists:
```typescript
// In /api/auth/signup
const tenant = await Tenant.findOne({ tenantId });
if (!tenant) {
  return res.status(400).json({ error: "Invalid tenant" });
}
```

---

## 🎯 Summary

**Question:** "Can't we fetch the tenantId from domain when the page loads?"

**Answer:** **We already do!** 🎉

- `useTenantBranding()` hook fetches it automatically
- It's stored in `branding.tenantId`
- We use it directly during signup
- No need for manual input or state duplication

The flow is:
```
Domain → API Call → Database Query → branding.tenantId → Signup
```

Simple, automatic, and secure!
