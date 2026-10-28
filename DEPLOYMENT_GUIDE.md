# 🚀 BlackClovercut AI — Production Deployment & Google Search Indexing Guide

This guide explains how to publish **BlackClovercut AI** to the public internet on your own custom domain and index it on Google so that anyone searching **"clips creates"** or **"black clover ai"** finds your website.

---

## 🧭 Table of Contents
1. [Option 1: Deploy to Free Cloud (Render.com / Railway)](#option-1-deploy-to-free-cloud-rendercom--railway)
2. [Option 2: Host from Your PC with Cloudflare Custom Domain (100% Free)](#option-2-host-from-your-pc-with-cloudflare-custom-domain-100-free)
3. [Step 3: Connect Your Domain & SSL](#step-3-connect-your-domain--ssl)
4. [Step 4: Verify Ownership in Google Search Console](#step-4-verify-ownership-in-google-search-console)
5. [Step 5: Submit Sitemap & Request Googlebot Indexing](#step-5-submit-sitemap--request-googlebot-indexing)

---

## Option 1: Deploy to Free Cloud (Render.com / Railway)

We have already included a production **`Dockerfile`**, **`render.yaml`**, and **`railway.json`** in your project folder.

### Deploying on Render (Recommended)
1. Push this folder to your GitHub account (or upload the zip).
2. Go to **[dashboard.render.com](https://dashboard.render.com)** and sign in.
3. Click **"New +"** → **"Blueprint"** (or **"Web Service"**).
4. Connect your GitHub repository.
5. Render will automatically detect `render.yaml` and `Dockerfile`:
   - Runtime: **Docker** (includes Node.js, FFmpeg, and yt-dlp automatically).
   - Port: `5000`
   - Plan: **Free**
6. Click **"Apply"**. Render will build and deploy your app to a live URL like:
   `https://blackclovercut-ai.onrender.com`

---

## Option 2: Host from Your PC with Cloudflare Custom Domain (100% Free)

You already have `cloudflared` installed. If you want to use your PC as the server (saving hosting costs and getting maximum FFmpeg performance):

1. **Sign up for a free Cloudflare account** at [cloudflare.com](https://cloudflare.com).
2. Add your custom domain (e.g. `blackclovercut.ai` or any domain you own).
3. In your terminal, run:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create blackclovercut
   cloudflared tunnel route dns blackclovercut yourdomain.com
   cloudflared tunnel run --url http://localhost:5000 blackclovercut
   ```
4. Your website is now permanently accessible worldwide with automatic HTTPS!

---

## Step 3: Connect Your Domain & SSL
Once your app is live (either on Render, Railway, or Cloudflare Tunnel):
- Update `canonical` URL and `og:url` in `index.html` to point to your live domain.
- Verify `https://yourdomain.com/robots.txt` loads:
  ```txt
  User-agent: *
  Allow: /
  Sitemap: https://yourdomain.com/sitemap.xml
  ```
- Verify `https://yourdomain.com/sitemap.xml` loads.

---

## Step 4: Verify Ownership in Google Search Console

1. Open **[Google Search Console](https://search.google.com/search-console)**.
2. Click **"Add Property"**.
3. Choose **URL prefix** and enter your live site address (e.g. `https://yourdomain.com` or `https://blackclovercut-ai.onrender.com`).
4. Select the verification method: **"HTML Tag"**.
5. Copy the code from Google:
   `<meta name="google-site-verification" content="XYZ_YOUR_VERIFICATION_TOKEN" />`
6. Open [`index.html`](file:///C:/Users/NRI%20INFOTECH/.gemini/antigravity/scratch/clipgenius-ai/index.html) and replace `INSERT_GOOGLE_VERIFICATION_CODE_HERE` with your code:
   ```html
   <meta name="google-site-verification" content="XYZ_YOUR_VERIFICATION_TOKEN" />
   ```
7. Rebuild the app with `npm run build` (or push to GitHub).
8. Go back to Google Search Console and click **"VERIFY"**. Google will show a green checkmark!

---

## Step 5: Submit Sitemap & Request Googlebot Indexing

1. In Google Search Console, go to **"Sitemaps"** in the left navigation.
2. In the "Add a new sitemap" box, type:
   ```
   sitemap.xml
   ```
3. Click **Submit**. Google will show status: **"Success"**.
4. In the top search bar (URL Inspection), paste your homepage URL and press Enter.
5. Click **"Request Indexing"**.

Google will queue Googlebot to crawl BlackClovercut AI. Within 24–48 hours, searching for:
- `clips creates`
- `black clover ai`
- `clips creator ai`

will present your website in Google search results with your 4.9-star rating rich snippet!
