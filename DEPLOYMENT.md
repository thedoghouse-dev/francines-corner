# Deployment Guide for Francine's Corner

## GitHub Pages Deployment

### Prerequisites
- GitHub account
- Git installed locally

### Step-by-Step Deployment

#### 1. Update package.json with Your GitHub Username

Open `package.json` and replace `YOURUSERNAME` in the homepage field with your actual GitHub username:

```json
"homepage": "https://your-actual-username.github.io/francines-app",
```

#### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `francines-app`
3. Keep it **Public** (required for free GitHub Pages)
4. Don't initialize with README (we already have code)
5. Click "Create repository"

#### 3. Push to GitHub

```bash
# Add the remote (replace YOURUSERNAME with your GitHub username)
git remote add origin https://github.com/YOURUSERNAME/francines-app.git

# Push your code
git push -u origin main
```

#### 4. Deploy to GitHub Pages

```bash
npm run deploy
```

This command will:
- Build the optimized production version
- Create a `gh-pages` branch
- Push the build to GitHub Pages
- Make your site live at: `https://YOURUSERNAME.github.io/francines-app`

#### 5. Configure GitHub Pages (First Time Only)

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Pages** section (left sidebar)
4. Under "Source", select branch: `gh-pages`
5. Click **Save**

Your site will be live in 1-2 minutes!

### Future Updates

Whenever you make changes:

```bash
# Make your changes
git add .
git commit -m "Your change description"
git push

# Deploy the updated version
npm run deploy
```

### Using a Custom Domain (francinescorner.com)

If you own `francinescorner.com`:

1. In your domain registrar (GoDaddy, Namecheap, etc.), add these DNS records:
   ```
   Type: A
   Host: @
   Value: 185.199.108.153

   Type: A
   Host: @
   Value: 185.199.109.153

   Type: A
   Host: @
   Value: 185.199.110.153

   Type: A
   Host: @
   Value: 185.199.111.153

   Type: CNAME
   Host: www
   Value: YOURUSERNAME.github.io
   ```

2. Create a file named `CNAME` in the `public` folder:
   ```
   francinescorner.com
   ```

3. Update `package.json` homepage to:
   ```json
   "homepage": "https://francinescorner.com",
   ```

4. Commit and deploy:
   ```bash
   git add .
   git commit -m "Add custom domain"
   npm run deploy
   ```

5. In GitHub repository Settings > Pages, add your custom domain: `francinescorner.com`

DNS propagation can take 24-48 hours.

---

## Alternative: Netlify (Even Easier!)

1. Go to https://netlify.com
2. Sign up with GitHub
3. Click "Add new site" > "Import an existing project"
4. Choose your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click "Deploy"

You'll get a URL like `francinesapp.netlify.app` instantly, and can add custom domain in Netlify settings.

---

**Current Status:** ✅ Configuration complete, ready to deploy!
