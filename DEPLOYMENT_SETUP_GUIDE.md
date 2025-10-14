# Auto-Deployment Setup Guide

## Option 1: Vercel (Recommended for Next.js)

### Step 1: Connect Repository to Vercel

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. **Import** your GitHub repository: `Vibe-coding-nvm-delete-repo/yt`
4. Vercel auto-detects Next.js settings

### Step 2: Configure Deployment Settings

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm ci
```

### Step 3: Environment Variables (if needed)

- Add any API keys or secrets in Vercel dashboard
- These will be available during build/runtime

### Step 4: Deploy

- Click **"Deploy"**
- Vercel will:
  ✅ Build your app
  ✅ Deploy to production
  ✅ Give you a URL: `your-app.vercel.app`

### Step 5: Enable Auto-Deployment

**Vercel does this automatically:**

- ✅ Every push to `main` → auto-deploys to production
- ✅ Every PR → creates preview deployment
- ✅ Shows deployment status in GitHub PR

**No additional configuration needed!**

---

## Option 2: GitHub Actions + Vercel (Manual Control)

If you want more control over deployments via GitHub Actions:

### Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Vercel
        id: deploy
        run: |
          if [[ "${{ github.event_name }}" == "push" && "${{ github.ref }}" == "refs/heads/main" ]]; then
            # Production deployment
            vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
          else
            # Preview deployment for PRs
            vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
          fi
```

**Required Secrets (add to GitHub repo settings):**

- `VERCEL_TOKEN` - Get from Vercel → Settings → Tokens
- `VERCEL_ORG_ID` - Get from Vercel project settings
- `VERCEL_PROJECT_ID` - Get from Vercel project settings

---

## Option 3: Netlify

### Step 1: Connect Repository

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select `Vibe-coding-nvm-delete-repo/yt`

### Step 2: Configure Build Settings

```
Build command: npm run build
Publish directory: .next
```

### Step 3: Add netlify.toml (optional)

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 4: Deploy

- Click **"Deploy site"**
- Netlify will auto-deploy on every push to `main`

---

## Why Deployments Sometimes Don't Work

### Common Issues:

1. **Branch Mismatch**
   - Deployment only configured for `main` branch
   - Your PR merged to different branch (e.g., `develop`, feature branch)
   - **Fix:** Check Vercel/Netlify settings → ensure correct branch

2. **Build Failures**
   - Deployment attempted but build failed
   - Check deployment logs in Vercel/Netlify dashboard
   - **Fix:** Run `npm run build` locally to catch errors first

3. **No Deployment Service Connected**
   - Your current situation
   - **Fix:** Connect Vercel or Netlify (see above)

4. **Deployment Paused/Disabled**
   - Auto-deployments turned off in Vercel/Netlify settings
   - **Fix:** Re-enable in deployment settings

5. **GitHub App Not Installed**
   - Vercel/Netlify GitHub app not installed on repo
   - **Fix:** Install the GitHub app for your organization

---

## Recommended Setup for Your Project

**Best Practice: Vercel with Auto-Deployment**

1. ✅ Connect repo to Vercel (5 min)
2. ✅ Vercel auto-deploys on every merge to `main`
3. ✅ Preview deployments for every PR
4. ✅ Deployment status shown in GitHub PRs
5. ✅ No GitHub Actions workflow needed (Vercel handles it)

**Why Vercel?**

- Built by the creators of Next.js
- Zero-config for Next.js apps
- Automatic preview deployments
- Edge network (fast globally)
- Free tier is generous

---

## Testing Auto-Deployment

After setup:

1. **Push to main:**

   ```bash
   git checkout main
   git pull
   echo "test" > test.txt
   git add test.txt
   git commit -m "test: Trigger deployment"
   git push
   ```

2. **Check deployment:**
   - Vercel: Check dashboard or GitHub PR
   - Should see: "Deployment in progress..."
   - Wait ~2-3 minutes
   - Should see: "Deployment successful ✓"

3. **Create PR:**

   ```bash
   git checkout -b test-deployment
   echo "pr test" > test2.txt
   git add test2.txt
   git commit -m "test: PR deployment"
   git push -u origin test-deployment
   gh pr create --title "Test deployment" --body "Testing auto-deployment"
   ```

4. **Verify preview deployment:**
   - PR should show "Preview deployment ready"
   - Click preview URL to test

---

## Next Steps

1. **Choose deployment platform:** Vercel (recommended)
2. **Connect your repository** (5 minutes)
3. **Test deployment** with a small commit to main
4. **Verify PR previews** work
5. **Update this guide** if you customize the setup

---

## Troubleshooting

**"Deployment failed"**

- Check build logs in Vercel/Netlify dashboard
- Run `npm run build` locally first
- Check for missing environment variables

**"No deployment triggered"**

- Verify branch name matches deployment config
- Check if Vercel/Netlify GitHub app is installed
- Ensure auto-deploy is enabled in settings

**"Preview deployment not showing in PR"**

- Vercel GitHub app needs "Checks" permission
- Re-install GitHub app with full permissions
- Check Vercel project settings → Git integration

---

**Questions?** Check:

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Next.js Deployment: https://nextjs.org/docs/deployment
