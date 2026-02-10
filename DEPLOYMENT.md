# 🚀 DEPLOYMENT GUIDE - Get Your App Live in 5 Minutes!

## ⚡ FASTEST: One-Click Deploy

### Option 1: Railway + Vercel (Recommended)

#### Step 1: Deploy Backend to Railway

1. **Go to Railway:** https://railway.app
2. **Sign in** with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select **`The-Angle-BOOK-Club-`** repository
5. Choose **`backend`** folder as root directory

6. **Add PostgreSQL Database:**
   - In your Railway project, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
   - Railway automatically sets `DATABASE_URL`

7. **Set Environment Variables:**
   - Go to backend service → **"Variables"** tab
   - Add:
     ```
     NODE_ENV=production
     JWT_SECRET=your-super-secret-key-min-32-chars
     GOOGLE_BOOKS_API_KEY=(optional)
     FRONTEND_URL=https://your-app.vercel.app
     PORT=3001
     ```

8. **Run Migrations:**
   - Settings → Custom Start Command: `npm run migrate && npm start`
   - Deploy will auto-run this

9. **Get Your Backend URL:**
   - Railway gives you: `https://your-backend.up.railway.app`
   - **SAVE THIS URL!**

---

#### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel:** https://vercel.com
2. **Sign in** with GitHub
3. Click **"Add New"** → **"Project"**
4. Import **`The-Angle-BOOK-Club-`** repo
5. Configure:
   - **Framework:** Vite
   - **Root:** `./` (project root)
   - **Build:** `npm run build`
   - **Output:** `dist`

6. **Environment Variables** (CRITICAL):
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   VITE_WS_URL=https://your-backend.up.railway.app
   ```
   (Use your Railway URL from Step 1!)

7. **Deploy!** → Takes ~2 minutes
8. **Get Your App URL:** `https://your-app.vercel.app`

---

#### Step 3: Update Backend CORS

Go back to Railway:
- Update `FRONTEND_URL` to your Vercel URL
- Redeploys automatically

---

## ✅ DONE! Your app is LIVE!

Visit your Vercel URL → Create account → Share books!

---

## 🐳 Option 2: Local Docker (Instant)

Want to see it running RIGHT NOW locally?

```bash
# 1. Install Docker Desktop (if not installed)
# Download from: https://www.docker.com/products/docker-desktop

# 2. Run this command in project root:
docker-compose up -d

# 3. Wait ~30 seconds, then visit:
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

That's it! Full app running locally with database.

**Stop it:** `docker-compose down`

---

## 🛠️ Option 3: Railway CLI (One Command)

```bash
# Install CLIs
npm i -g @railway/cli vercel

# Run deploy script
./deploy.sh

# Script will:
# - Login to Railway & Vercel
# - Deploy backend + database
# - Run migrations
# - Deploy frontend
# - Configure everything

# 5 minutes total!
```

---

## 📊 Free Tier Limits

**Railway (Backend + DB):**
- $5 free credits/month
- ~500 hours runtime
- Perfect for personal projects

**Vercel (Frontend):**
- Unlimited deployments
- 100GB bandwidth/month
- Custom domains free

---

## 🔧 Troubleshooting

### Backend Issues
- **Won't start:** Check Railway logs (Dashboard → Logs)
- **Database error:** Verify PostgreSQL service is running
- **Migrations failed:** Run manually via Railway CLI: `railway run npm run migrate`

### Frontend Issues
- **Can't connect:** Check VITE_API_URL in Vercel environment variables
- **CORS error:** Update FRONTEND_URL in Railway backend
- **Build failed:** Check Node version (should be 18+)

### Test Your Deployment
1. **Backend health check:** Visit `https://your-backend.railway.app/health`
2. **API test:** Visit `https://your-backend.railway.app/api/posts`
3. **Frontend:** Visit your Vercel URL

---

## 🎯 Quick Links

- **Railway Dashboard:** https://railway.app/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs

---

## 💡 Pro Tips

1. **Custom Domain:** Add in Vercel settings (free)
2. **Auto-deploy:** Push to GitHub = auto-deploy (both platforms)
3. **Monitoring:** Check Railway/Vercel dashboards for traffic
4. **Logs:** Real-time logs available in both dashboards

---

Need help? Check the logs first - they'll tell you exactly what's wrong!

**Your app will be PUBLIC and LIVE in 5 minutes!** 🚀📚
