@echo off
echo ========================================
echo Deploying to Vercel via CLI
echo ========================================
echo.

echo Step 1: Installing Vercel CLI (if not installed)...
call npm install -g vercel
echo.

echo Step 2: Linking to your Vercel account...
echo You will be prompted to log in to Vercel
call vercel login
echo.

echo Step 3: Deploying to production...
echo.
echo IMPORTANT: When prompted, answer these questions:
echo   - Set up and deploy? [Y/n] Y
echo   - Which scope? Choose your account
echo   - Link to existing project? [y/N] N
echo   - Project name? Press Enter for default
echo   - Directory? Press Enter (use current)
echo   - Override settings? [y/N] N
echo.
call vercel --prod
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Copy the deployment URL shown above
echo 2. Go to vercel.com and add environment variables
echo 3. Redeploy after adding environment variables
echo.
pause
