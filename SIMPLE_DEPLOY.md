# Simple Deployment Guide (No Browser Login)

## Step 1: Push to GitHub

```bash
cd c:\Users\Public\cms-login

# Initialize git
git init
git add .
git commit -m "Initial commit: CMS Login System"

# Create repo on GitHub (go to github.com/new)
# Then connect:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy using GitHub Pages

```bash
# Install gh-pages package
npm install --save-dev gh-pages

# Deploy (automatic build + deploy)
npm run deploy
```

Your site will be live at:
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

---

## Step 3: Enable GitHub Pages

1. Go to your repo on GitHub
2. Click "Settings"
3. Scroll to "Pages" (left sidebar)
4. Source: Select "gh-pages" branch
5. Click "Save"
6. Wait 1-2 minutes
7. Your site is live! 🎉

---

## Alternative: Netlify Drop

1. Build your project:
   ```bash
   npm run build
   ```

2. Go to https://app.netlify.com/drop

3. Drag and drop the `dist` folder

4. Done! Instant deployment without login! 🚀

---

## Quick Commands

```bash
# Build only
npm run build

# Deploy to GitHub Pages
npm run deploy

# Check if deployed
# Visit: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

---

## Troubleshooting

**404 Error?**
- Make sure GitHub Pages is enabled in repo settings
- Check branch is set to "gh-pages"
- Wait 2-3 minutes for deployment

**Blank page?**
- Check browser console for errors
- Verify `dist` folder was created after build

**Need to update?**
```bash
git add .
git commit -m "Update"
git push
npm run deploy
```
