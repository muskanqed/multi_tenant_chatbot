# 🚀 Vercel Deployment Guide - Step by Step

## Prerequisites

- ✅ GitHub account
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ Your code in a GitHub repository
- ✅ MongoDB Atlas database (or other MongoDB instance)
- ✅ Google Gemini API key

---

## Step 1: Prepare Your Code for Deployment

### 1.1 Commit Your Changes

```bash
# Add all files
git add .

# Commit with a descriptive message
git commit -m "feat: prepare for Vercel deployment with multi-tenant support"

# Push to GitHub
git push origin master
```

---

## Step 2: Deploy to Vercel

### 2.1 Sign in to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. Sign in with your GitHub account (recommended)

### 2.2 Import Your Project

1. Click "Add New..." → "Project"
2. Select "Import Git Repository"
3. Find your `multi_tenant_chatbot` repository
4. Click "Import"

### 2.3 Configure Project Settings

**Framework Preset:** Next.js (should be auto-detected)

**Root Directory:** `./` (leave as default)

**Build Settings:**
- **Build Command:** `npm run build` (already configured in vercel.json)
- **Output Directory:** `.next` (default, don't change)
- **Install Command:** `npm install --include=optional` (already configured in vercel.json)

**Node.js Version:** 20.x (recommended)

---

## Step 3: Set Environment Variables

⚠️ **CRITICAL STEP** - Your app won't work without these!

Click on "Environment Variables" section and add the following:

### 3.1 Database Configuration

**Key:** `MONGODB_URI`
**Value:** Your MongoDB connection string
```
mongodb+srv://admin:admin@cluster0.nsnkipx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```
**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 3.2 NextAuth Configuration

**Key:** `NEXTAUTH_SECRET`
**Value:** Your secret key
```
sdfljsdlfjsljflsjflkjsdflkj
```
**Environments:** ✅ Production, ✅ Preview, ✅ Development

⚠️ **DO NOT ADD `NEXTAUTH_URL`** - Let Vercel auto-detect for multi-tenant support

---

### 3.3 Google Gemini API

**Key:** `GEMINI_API_KEY`
**Value:** Your Gemini API key
```
AIzaSyCvPuxwAtJH5l6GXBPxTfzZwVqOXHxLEXs
```
**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

### 3.4 Admin Credentials

**Key:** `ADMIN_EMAIL`
**Value:**
```
admin@example.com
```
**Environments:** ✅ Production, ✅ Preview, ✅ Development

**Key:** `ADMIN_PASSWORD`
**Value:**
```
your-secure-password
```
**Environments:** ✅ Production, ✅ Preview, ✅ Development

---

## Step 4: Deploy!

1. Click **"Deploy"** button
2. Wait 2-5 minutes for the build to complete
3. ✅ You'll see "Congratulations! Your project has been deployed"

---

## Step 5: Post-Deployment Setup

### 5.1 Get Your Deployment URL

Your app will be deployed at: `https://your-project-name.vercel.app`

### 5.2 Create Your First Tenant

1. Go to `https://your-project-name.vercel.app`
2. Sign in with admin credentials:
   - Email: `admin@example.com`
   - Password: `your-secure-password`
3. Go to Admin Dashboard → Create Tenant
4. Fill in tenant details:
   - **Tenant ID:** `demo` (lowercase, no spaces)
   - **Name:** `Demo Company`
   - **Domain:** `your-project-name.vercel.app` (your Vercel domain)
   - **Theme Color:** `#3b82f6`
   - Upload logo (optional)
   - Set welcome message
   - Choose AI model

5. Click "Create Tenant"

### 5.3 Test Tenant Access

1. Sign out from admin
2. Go to `https://your-project-name.vercel.app/auth/signup`
3. You should see your tenant branding (logo, name, colors)
4. Create a test user account
5. Sign in and test the chatbot!

---

## Step 6: Set Up Custom Domains (Optional)

### For Multi-Tenant Setup with Custom Domains:

#### 6.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `chatbot.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions

#### 6.2 Add Wildcard Domain (for multiple tenants)

1. Add `*.yourdomain.com` as a domain
2. Configure DNS with a CNAME record:
   ```
   Name: *
   Type: CNAME
   Value: cname.vercel-dns.com
   ```

#### 6.3 Update Tenant Domains in Database

For each tenant, update the domain field:
- Tenant 1: `tenant1.yourdomain.com`
- Tenant 2: `tenant2.yourdomain.com`
- etc.

---

## Troubleshooting

### Build Failed: "Cannot find module lightningcss"

**Solution:** Already fixed with our `vercel.json` and `.npmrc` files. If it still fails:

1. Check build logs for exact error
2. Verify `vercel.json` has `"installCommand": "npm install --include=optional"`
3. Redeploy

### Environment Variable Not Working

**Solution:**
1. Go to Project Settings → Environment Variables
2. Verify all variables are set for all environments
3. Click "Redeploy" (important: redeployment is needed after adding env vars)

### App Loads but Shows "Configuration Error"

**Cause:** No tenant found for domain

**Solution:**
1. Go to admin panel
2. Create a tenant with domain matching your Vercel URL
3. Example: If deployed at `my-app.vercel.app`, set tenant domain to `my-app.vercel.app`

### Database Connection Error

**Solution:**
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas network access:
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allow all) for Vercel
3. Verify database user permissions

### Admin Login Not Working

**Solution:**
1. Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables
2. Make sure they match what you're typing
3. Try redeploying after setting variables

---

## Post-Deployment Checklist

- [ ] App successfully deployed
- [ ] All environment variables set
- [ ] Admin login works
- [ ] At least one tenant created
- [ ] Tenant signup page shows branding
- [ ] User can sign up and sign in
- [ ] Chat functionality works
- [ ] Messages are saved to database
- [ ] Custom domain configured (optional)

---

## Monitoring & Logs

### View Deployment Logs

1. Go to Vercel Dashboard → Your Project
2. Click on latest deployment
3. Click "Build Logs" to see build output
4. Click "Function Logs" to see runtime logs

### Real-time Function Logs

1. Go to Project → Logs tab
2. See real-time server logs
3. Filter by errors, warnings, etc.

---

## Updating Your Deployment

When you push code to GitHub:

```bash
git add .
git commit -m "your changes"
git push origin master
```

Vercel will automatically:
- Detect the push
- Build your app
- Deploy if build succeeds

---

## Cost

**Vercel Free Tier includes:**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless Functions
- ✅ Automatic HTTPS
- ✅ Custom domains

**What you'll pay for:**
- MongoDB Atlas: Free tier (512 MB storage)
- Google Gemini: Free tier (60 requests/minute)

**Total cost for small apps:** $0/month! 🎉

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Check deployment logs in Vercel dashboard
- Check server logs for runtime errors

---

## Security Checklist

- [ ] Strong admin password set
- [ ] `NEXTAUTH_SECRET` is random and secure
- [ ] MongoDB credentials are secure
- [ ] API keys are not exposed in client code
- [ ] Database has network access restrictions (if possible)
- [ ] Environment variables are not in git history

---

## Next Steps After Deployment

1. **Test thoroughly:** Sign up users, test chat, check all features
2. **Monitor usage:** Check Vercel Analytics and Function logs
3. **Add more tenants:** Create tenants for different clients
4. **Customize branding:** Upload logos, set theme colors
5. **Set up custom domains:** Add your own domains for professional look
6. **Enable analytics:** Track usage and performance
7. **Set up monitoring:** Use Vercel Analytics or other tools

---

Good luck with your deployment! 🚀
