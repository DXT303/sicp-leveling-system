# Deployment Guide

## Step 1: Push to GitHub

### Initialize Git (if not done yet)
```bash
cd c:\Users\Public\cms-login
git init
git add .
git commit -m "Initial commit: CMS Login System"
```

### Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `cms-login-system` (or your preferred name)
3. Description: "Survey Leveling System with authentication"
4. Keep it Public or Private (your choice)
5. **DO NOT** check "Initialize with README" (you already have files)
6. Click "Create repository"

### Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/cms-login-system.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel (Recommended)

### Option A: Using Vercel Website
1. Go to https://vercel.com
2. Click "Sign Up" or "Login" (use GitHub account)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"
7. Wait 1-2 minutes
8. Your site will be live at: `https://your-project.vercel.app`

### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? cms-login-system
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

---

## Step 3: Alternative - Deploy to Netlify

1. Go to https://netlify.com
2. Click "Sign Up" or "Login" (use GitHub account)
3. Click "Add new site" → "Import an existing project"
4. Choose "GitHub" and authorize
5. Select your repository
6. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click "Deploy site"
8. Your site will be live at: `https://your-site.netlify.app`

---

## Step 4: Update Package.json (Optional)

Add homepage field if needed:
```json
{
  "homepage": "https://your-username.github.io/cms-login-system"
}
```

---

## Important Notes

⚠️ **Backend API**: The current setup has a backend (server.js). For full functionality:
- Deploy backend separately (Railway, Render, or Heroku)
- Update API endpoints in frontend code
- Or use serverless functions (Vercel/Netlify Functions)

⚠️ **Environment Variables**: If you have sensitive data:
- Add `.env` file to `.gitignore` (already done)
- Set environment variables in Vercel/Netlify dashboard

⚠️ **Images**: Make sure `eng.jpg` is in the `public` folder

---

## Troubleshooting

### Build fails?
- Check Node version: `node --version` (should be 16+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Routes not working?
- Vercel/Netlify should handle SPA routing automatically
- Check `vercel.json` or `_redirects` file

### API not working?
- Backend needs separate deployment
- Update API URLs in code

---

## Quick Deploy Commands

```bash
# 1. Commit changes
git add .
git commit -m "Ready for deployment"
git push

# 2. Deploy to Vercel
vercel --prod

# Done! 🚀
```

---

## Your Live URLs

After deployment, you'll get:
- **Vercel**: `https://cms-login-system.vercel.app`
- **Netlify**: `https://cms-login-system.netlify.app`
- **Custom Domain**: You can add your own domain later

---

Need help? Check:
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
