# Deployment Guide

## Common Deployment Issues & Solutions

### 1. LightningCSS Error: "Cannot find module '../lightningcss.linux-x64-gnu.node'"

**Cause:** Tailwind CSS v4 uses `lightningcss` which requires platform-specific native binaries. This error occurs when the deployment environment can't find or install the correct binary.

**Solutions:**

#### Option A: Ensure Dependencies are Installed Correctly

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install --include=optional

# Then build
npm run build
```

#### Option B: Platform-Specific Configuration

For deployment platforms (Vercel, Netlify, Railway, etc.):

**1. Vercel:**
```json
// vercel.json
{
  "buildCommand": "npm install --include=optional && npm run build",
  "installCommand": "npm install --include=optional"
}
```

**2. Netlify:**
```toml
# netlify.toml
[build]
  command = "npm install --include=optional && npm run build"
  publish = ".next"
```

**3. Railway/Render:**
Add to build command:
```bash
npm install --include=optional && npm run build
```

#### Option C: Downgrade to Tailwind CSS v3 (if issues persist)

If you continue to have issues, you can downgrade to Tailwind CSS v3 which doesn't use lightningcss:

```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@^3 postcss autoprefixer
npx tailwindcss init -p
```

Then update your `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

And update `postcss.config.js`:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 2. Environment Variables

Ensure all environment variables are set in your deployment platform:

**Required:**
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `GEMINI_API_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

**Important for Multi-Tenant:**
- **DO NOT set** `NEXTAUTH_URL` in production (let Next.js auto-detect)
- Or set it to your primary domain only

### 3. Build Configuration

Your `package.json` should have:
```json
{
  "scripts": {
    "build": "next build"
  }
}
```

**Note:** We removed `--turbopack` from the build command as it's experimental and can cause issues with native dependencies.

### 4. Node.js Version

Ensure your deployment platform uses Node.js 18+ (20+ recommended):

```json
// package.json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### 5. Memory Issues During Build

If you encounter out-of-memory errors during build:

```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

Or add to your deployment platform's build settings.

## Platform-Specific Deployment Steps

### Vercel

1. Connect your GitHub repository
2. Set environment variables in Settings → Environment Variables
3. Deploy

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install --include=optional`

### Netlify

1. Connect your GitHub repository
2. Set environment variables in Site settings → Environment variables
3. Configure build settings:
   - Build command: `npm install --include=optional && npm run build`
   - Publish directory: `.next`

### Railway

1. Create new project from GitHub
2. Add environment variables
3. Set custom build command: `npm install --include=optional && npm run build`
4. Set start command: `npm start`

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies including optional ones
COPY package*.json ./
RUN npm install --include=optional --production=false

# Copy app files
COPY . .

# Build the app
RUN npm run build

# Start the app
CMD ["npm", "start"]
```

## Troubleshooting

### Check if lightningcss is installed:
```bash
npm list lightningcss
```

### Verify platform-specific binary:
```bash
# Linux
ls node_modules/lightningcss-linux-x64-gnu/

# macOS (ARM)
ls node_modules/lightningcss-darwin-arm64/

# Windows
dir node_modules\lightningcss-win32-x64-msvc\
```

### Clean install:
```bash
rm -rf node_modules package-lock.json .next
npm install --include=optional
npm run build
```

## Multi-Tenant Domain Setup

For production multi-tenant setup:

1. **Configure DNS:**
   - Point all tenant domains to your deployment
   - Use wildcard DNS if needed: `*.yourdomain.com`

2. **Update tenant domains in database:**
   - Each tenant should have the correct production domain
   - Example: `tenant1.yourdomain.com`

3. **Test domain resolution:**
   ```bash
   curl https://tenant1.yourdomain.com/api/tenant/by-domain?domain=tenant1.yourdomain.com
   ```

## Contact

If issues persist, check:
- Build logs in your deployment platform
- Server logs for runtime errors
- Network tab in browser DevTools
