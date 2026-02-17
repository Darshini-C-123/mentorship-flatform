# Deploying peer-peer-study (Next.js Mentorship Platform)

This guide covers deploying to **Vercel** or **Netlify**, configuring environment variables, Google OAuth for production, MongoDB in production, and optional custom domain setup.

---

## 1. Deployment configuration

### Option A: Deploy on Vercel (recommended for Next.js)

1. **Push your code to GitHub** (if not already):
   - Create a repo and push your project. Do **not** commit `.env` or any file containing real secrets.

2. **Sign in to Vercel**: [vercel.com](https://vercel.com) → Sign in with GitHub.

3. **Import the project**:
   - Click **Add New…** → **Project**.
   - Import your GitHub repository (e.g. `peer-peer-study`).
   - Leave **Framework Preset** as **Next.js** and **Root Directory** as `.` unless your app lives in a subfolder.

4. **Configure environment variables** (see Section 2 below). Add all required variables in the Vercel project **Settings → Environment Variables** before the first deploy.

5. **Deploy**:
   - Click **Deploy**. Vercel will run `next build` and deploy.
   - Your site will be at `https://<your-project-name>.vercel.app` (or a custom domain you add later).

6. **Redeploy after env changes**:  
   After adding or changing env vars, trigger a new deploy (Deployments → ⋮ → Redeploy).

---

### Option B: Deploy on Netlify

1. **Push your code to GitHub** (do not commit `.env`).

2. **Sign in to Netlify**: [netlify.com](https://netlify.com) → Sign in with GitHub.

3. **Add a new site**:
   - **Add new site** → **Import an existing project** → **GitHub** → choose your repo.

4. **Build settings** (Netlify will often auto-detect Next.js):
   - **Build command**: `npm run build` or `next build`
   - **Publish directory**: `.next` is used internally; for Next.js on Netlify you typically use:
     - **Publish directory**: leave as default (e.g. `.next` or as suggested by Netlify’s Next.js detection).
   - Netlify’s Next.js runtime will use the correct output. If you use **Next.js on Netlify**, follow their suggested **Build command** and **Publish directory** (often **Build command**: `next build`, **Publish directory**: `.next` or their default).

5. **Environment variables**: In **Site settings → Environment variables**, add all variables from Section 2.

6. **Deploy**: Trigger a deploy. Your site will be at `https://<random-name>.netlify.app` or a custom domain.

**Note**: For the best Next.js experience (API routes, server components, ISR), Vercel is usually simpler. If you use Netlify, ensure you use their official Next.js support / plugin.

---

## 2. Environment variables checklist

A template with variable names (no real secrets) is in **`env.example`**. Set these in your hosting dashboard (Vercel: **Project → Settings → Environment Variables**; Netlify: **Site settings → Environment variables**). Use **Production** (and optionally **Preview** if you want staging to work the same).

| Variable | Required | Description | Example (value is secret) |
|----------|----------|-------------|---------------------------|
| `MONGODB_URI` | Yes | MongoDB connection string (Atlas or other). Use the same or a dedicated production cluster. | `mongodb+srv://user:pass@cluster.mongodb.net/...` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 Client ID from Google Cloud Console. | `....apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth 2.0 Client Secret. | `GOCSPX-...` |
| `GOOGLE_REDIRECT_URI` | Yes (production) | **Exact** callback URL used in production. Must match one of the “Authorized redirect URIs” in Google Cloud. | `https://your-domain.com/api/auth/google/callback` |
| `JWT_SECRET` | Strongly recommended | Secret used to sign auth cookies. Generate a long random string and **do not** use the default from code. | e.g. `openssl rand -base64 32` |

- **Migrating from local**: Copy the **names** from your local `.env` and re-enter the **values** in the dashboard. Do not paste `.env` contents into the repo or into docs.
- **Production vs local**:  
  - Local: `GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback`  
  - Production: set `GOOGLE_REDIRECT_URI` to your live callback URL (see Section 3).

---

## 3. OAuth production update (Google Cloud Console)

So that “Sign in with Google” works on your **live** site, add the production URLs in Google Cloud Console.

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Open your **OAuth 2.0 Client ID** (Web application type).
3. Under **Authorized redirect URIs**, add **all** of these that apply (replace with your real domains):

- **Vercel (default subdomain)**  
  `https://<your-vercel-project-name>.vercel.app/api/auth/google/callback`

- **Netlify (default subdomain)**  
  `https://<your-site-name>.netlify.app/api/auth/google/callback`

- **Custom domain (when you add one)**  
  `https://yourdomain.com/api/auth/google/callback`  
  and, if you use `www`:  
  `https://www.yourdomain.com/api/auth/google/callback`

4. Under **Authorized JavaScript origins** (if present), add the **origins** (no path):

- `https://<your-vercel-project-name>.vercel.app`
- `https://<your-site-name>.netlify.app`
- `https://yourdomain.com`
- `https://www.yourdomain.com` (if you use www)

5. Save. Changes can take a few minutes to apply.

6. Set the **same** URL in your hosting env as `GOOGLE_REDIRECT_URI` (e.g. exactly one of the redirect URIs you added). Your app uses `GOOGLE_REDIRECT_URI` when set, so it must match exactly what’s in Google.

---

## 4. Database connection (MongoDB / Mongoose)

Your app uses **Mongoose** (no Prisma) and reads `MONGODB_URI` from the environment.

- **Production URI**: In the hosting dashboard, set `MONGODB_URI` to your **production** MongoDB connection string (e.g. MongoDB Atlas). Prefer a dedicated cluster or database for production instead of the same DB as local dev.
- **Atlas**: In MongoDB Atlas, allow access from anywhere (`0.0.0.0/0`) for Vercel/Netlify IPs, or use “Network Access” and add the recommended rules. Ensure the database user has the right roles.
- **Connection handling**: Your `lib/db.ts` already uses a cached connection and timeouts; that works for serverless (Vercel/Netlify). No code change is required for production; just set `MONGODB_URI` in the dashboard.
- **Secrets**: Never commit `MONGODB_URI`; only set it in the host’s environment variables.

---

## 5. Custom domain (later)

### Vercel

1. **Project** → **Settings** → **Domains**.
2. **Add** your domain (e.g. `yourdomain.com`).
3. Follow Vercel’s instructions to add the DNS records at your registrar (usually an **A** record or **CNAME** they show).
4. After the domain is verified, Vercel will serve the site and provide HTTPS.
5. Add `https://yourdomain.com/api/auth/google/callback` (and `https://www.yourdomain.com/...` if you use www) to Google **Authorized redirect URIs**, and set `GOOGLE_REDIRECT_URI` to that URL. Redeploy if needed.

### Netlify

1. **Site** → **Domain management** → **Add custom domain**.
2. Enter the domain and follow Netlify’s DNS instructions (CNAME or A record).
3. Enable **HTTPS** (Netlify provisions a certificate automatically).
4. Add the same callback URL(s) in Google and in `GOOGLE_REDIRECT_URI`, then redeploy.

---

## Quick checklist before go-live

- [ ] Code pushed to GitHub (no `.env` or secrets in repo).
- [ ] All env vars set in Vercel/Netlify (see table in Section 2).
- [ ] `GOOGLE_REDIRECT_URI` set to the **exact** production callback URL.
- [ ] Google Cloud: production callback URL(s) and origins added and saved.
- [ ] `JWT_SECRET` set to a strong random value in production.
- [ ] `MONGODB_URI` points to production MongoDB and is reachable (e.g. Atlas network access).
- [ ] After any env or domain change: redeploy and test “Sign in with Google” on the live URL.
