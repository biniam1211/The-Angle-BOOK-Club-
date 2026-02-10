#!/bin/bash

# 🚀 Quick Deploy Script for The Angle BOOK Club
# Deploys to Railway (backend) and Vercel (frontend)

set -e  # Exit on error

echo "📚 The Angle BOOK Club - Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}⚠️  Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

echo ""
echo -e "${GREEN}✅ CLIs ready!${NC}"
echo ""

# Ask user if they want to proceed
read -p "This will deploy your app to the cloud. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo -e "${GREEN}🔐 Step 1: Login to Railway${NC}"
railway login

echo ""
echo -e "${GREEN}🔐 Step 2: Login to Vercel${NC}"
vercel login

echo ""
echo -e "${GREEN}🚂 Step 3: Deploy Backend to Railway${NC}"
cd backend
railway init --name "angle-book-club-backend" || railway link

echo ""
echo -e "${GREEN}🗄️  Step 4: Add PostgreSQL Database${NC}"
railway add --database postgres || echo "Database might already exist"

echo ""
echo -e "${GREEN}⚙️  Step 5: Set Backend Environment Variables${NC}"
read -p "Enter your JWT_SECRET (press Enter for auto-generated): " jwt_secret
if [ -z "$jwt_secret" ]; then
    jwt_secret=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    echo "Generated JWT_SECRET: $jwt_secret"
fi

railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$jwt_secret"
railway variables set PORT=3001

read -p "Enter Google Books API Key (optional, press Enter to skip): " google_key
if [ ! -z "$google_key" ]; then
    railway variables set GOOGLE_BOOKS_API_KEY="$google_key"
fi

echo ""
echo -e "${GREEN}🚀 Step 6: Deploy Backend${NC}"
railway up

echo ""
echo -e "${GREEN}📍 Step 7: Get Backend URL${NC}"
backend_url=$(railway domain 2>/dev/null || echo "")
if [ -z "$backend_url" ]; then
    echo "Could not auto-detect Railway domain."
    read -p "Enter your Railway backend URL (e.g., your-app.up.railway.app): " backend_url
fi

echo "Backend URL: https://$backend_url"

railway variables set FRONTEND_URL="https://your-app.vercel.app"

echo ""
echo -e "${GREEN}🗄️  Step 8: Run Database Migrations${NC}"
railway run npm run migrate

cd ..

echo ""
echo -e "${GREEN}☁️  Step 9: Deploy Frontend to Vercel${NC}"
vercel --prod \
  --build-env VITE_API_URL="https://$backend_url/api" \
  --build-env VITE_WS_URL="https://$backend_url" \
  --yes

echo ""
echo -e "${GREEN}📍 Step 10: Get Frontend URL${NC}"
frontend_url=$(vercel inspect --json | grep -o '"url":"[^"]*' | grep -o 'https://[^"]*' | head -1 || echo "")
if [ -z "$frontend_url" ]; then
    echo "Could not auto-detect Vercel URL."
    read -p "Enter your Vercel frontend URL (e.g., your-app.vercel.app): " frontend_url
fi

echo "Frontend URL: $frontend_url"

echo ""
echo -e "${GREEN}🔄 Step 11: Update Backend CORS${NC}"
cd backend
railway variables set FRONTEND_URL="$frontend_url"

cd ..

echo ""
echo ""
echo -e "${GREEN}=========================================="
echo "✅ DEPLOYMENT COMPLETE! 🎉"
echo "==========================================${NC}"
echo ""
echo "Your app is now LIVE on the internet:"
echo ""
echo -e "${GREEN}🌐 Frontend:${NC} $frontend_url"
echo -e "${GREEN}🔌 Backend:${NC}  https://$backend_url"
echo ""
echo "Next steps:"
echo "1. Visit $frontend_url"
echo "2. Create an account"
echo "3. Start sharing books with the world! 📚"
echo ""
echo "Useful commands:"
echo "  - View backend logs: cd backend && railway logs"
echo "  - View frontend logs: vercel logs"
echo "  - Redeploy backend: cd backend && railway up"
echo "  - Redeploy frontend: vercel --prod"
echo ""
