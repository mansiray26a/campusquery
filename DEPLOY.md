# 🚀 CampusQuery Deployment Guide

This guide provides full instructions for deploying **CampusQuery**:
- **Frontend** on [Vercel](https://vercel.com)
- **Backend** on [Render](https://render.com)

---

## 1. ⚙️ Backend Deployment (Render)

### Step 1: Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) → Click **New +** → Select **Web Service**.
2. Connect your GitHub repository `mansiray26a/campusquery`.

### Step 2: Configure Service Settings
- **Name**: `campusquery-backend`
- **Region**: Select closest to your users (e.g. Singapore / US East)
- **Branch**: `main`
- **Root Directory**: `backend` (or leave blank if using root `package.json`)
- **Runtime**: `Node`
- **Build Command**: `npm install` (or `npm run build`)
- **Start Command**: `npm start` (or `node server.js`)

### Step 3: Add Environment Variables on Render
Under the **Environment** tab, add:
| Key | Value / Example | Description |
|---|---|---|
| `NODE_ENV` | `production` | Sets server to production mode |
| `PORT` | `5000` | Port for Express server |
| `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/campusquery` | MongoDB Atlas URI |
| `JWT_SECRET` | `supersecretkeycampusquery2026` | Secret key for JWT authentication |
| `GROQ_API_KEY` | `gsk_...` | Your Groq LLM API Key |

*After setting these, Render will deploy your API service at `https://campusquery-j60o.onrender.com`.*

---

## 2. 🎨 Frontend Deployment (Vercel)

### Step 1: Import Project on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Click **Add New...** → **Project**.
2. Import `mansiray26a/campusquery`.

### Step 2: Configure Vercel Project
- **Framework Preset**: `Vite`
- **Root Directory**: Select `frontend`
- **Build Command**: `npm run build` (default)
- **Output Directory**: `dist` (default)

### Step 3: Add Environment Variables on Vercel
Under **Environment Variables**, add:
| Key | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://campusquery-j60o.onrender.com/api` | Full URL to your Render API |

*Click **Deploy**. Your frontend will be live at `https://campusquery-red.vercel.app` (or your custom domain).*

---

## 🔍 Troubleshooting

- **`CORS policy: origin ... not allowed`**: Ensure `backend/server.js` permits requests from `*.vercel.app` (already included).
- **`Failed to fetch`**: Verify `VITE_API_URL` environment variable on Vercel points to your live Render backend URL ending in `/api`.
- **`Permission denied: nodemon`**: Fixed — `npm start` and `npm run dev` in `backend/package.json` both invoke `node server.js` directly.
