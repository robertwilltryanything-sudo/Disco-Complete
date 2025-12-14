# Deploying Your DiscO App

This guide will walk you through deploying your application to **Vercel**, a modern and powerful platform for web projects that offers a generous free tier and an excellent developer experience.

## Why Vercel is Recommended

Vercel is the best choice for this project because:
- It has first-class support for Vite, meaning it works **out-of-the-box with zero configuration**.
- It provides incredibly fast deployments and a global CDN to make your app fast for everyone.
- It automatically builds and deploys your site on every `git push`.
- It has a simple, secure interface for managing the environment variables needed for your API keys.

Deploying to other platforms like GitHub Pages is possible but often requires complex workarounds and is not recommended for this type of application.

---

## Important Note on Build Errors

You may encounter build errors during deployment. This is a common issue related to corrupt package caches or tool version inconsistencies on build servers. To solve this, this project has been configured to be more resilient:

1.  **Using the Required Node.js Version**: The `package.json` file instructs Vercel to use **Node.js v22.x**. This version is now required by the Vercel build environment to ensure compatibility with their platform updates.
2.  **Using `npm`**: The `vercel.json` file instructs Vercel to use the `npm` package manager. This is a strategic choice to bypass a persistent, environment-specific error that was occurring with `pnpm` on the Vercel build platform.
3.  **Clean Dependency Resolution**: The project uses a minimal `package-lock.json`. This ensures that `npm` resolves and installs fresh dependencies during deployment, preventing conflicts from an outdated or corrupt lock file.

With these settings, Vercel will automatically use the correct versions of Node.js and `npm`, install your dependencies cleanly, and build your project. **You do not need to override any settings in the Vercel UI.**

---

## 5-Minute Deployment Guide

### Step 1: Sign Up for Vercel

1.  Go to [vercel.com/signup](https://vercel.com/signup).
2.  **Sign up with your GitHub account**. This is the easiest way to connect your repository.

### Step 2: Import Your Project

1.  From your Vercel dashboard, click "**Add New...**" and select "**Project**".
2.  Find your **DiscO** GitHub repository and click "**Import**".

### Step 3: Configure Environment Variables

Vercel will detect that you are using Vite. You just need to provide the keys for the features you want to use.

1.  On the "Configure Project" screen, expand the **Environment Variables** section.
2.  Add the following keys based on your needs.

#### A. Required: AI Features (Gemini)
To enable AI scanning and trivia:
1.  Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Add it to Vercel:
    *   **Key:** `VITE_API_KEY`
    *   **Value:** `Your_Gemini_API_Key_Here`

#### B. Optional: Real-time Database (Supabase)
To enable cross-device sync via Supabase:
1.  Create a project at [Supabase](https://supabase.com/).
2.  Go to **Project Settings > API**.
3.  Add to Vercel:
    *   **Key:** `VITE_SUPABASE_URL`
    *   **Value:** `Your_Project_URL`
    *   **Key:** `VITE_SUPABASE_ANON_KEY`
    *   **Value:** `Your_anon_public_Key`

#### C. Optional: Google Drive Sync
To enable Google Drive backup:
1.  Create a Client ID in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2.  Add to Vercel:
    *   **Key:** `VITE_GOOGLE_CLIENT_ID`
    *   **Value:** `Your_Client_ID`

### Step 4: Deploy!

1.  Click the "**Deploy**" button.
2.  Vercel will build and deploy your project.
3.  Once finished, you will get a live URL (e.g., `disco-app.vercel.app`).

**Note:** If you added optional variables (Supabase/Google Drive) *after* the initial deployment, you must go to the **Deployments** tab in Vercel and "Redeploy" for them to take effect.