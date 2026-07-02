# 🚀 AZURE DEPLOYMENT GUIDE - Full Cloud Infrastructure

Complete guide to deploying The Angle BOOK Club on Microsoft Azure with all services.

---

## 📊 **Azure Architecture Overview**

```
Internet
   │
   ├─→ Azure Front Door (CDN + WAF)
   │      ├─→ Static Web App (Frontend)
   │      └─→ App Service (Backend API)
   │             ├─→ PostgreSQL Flexible Server
   │             ├─→ SignalR Service (WebSocket)
   │             ├─→ Blob Storage (Uploads)
   │             ├─→ Key Vault (Secrets)
   │             ├─→ Redis Cache (Performance)
   │             └─→ Application Insights (Monitoring)
```

---

## 💰 **Cost Estimate (Monthly)**

**Free Tier (Development):**
- Static Web App: Free
- App Service B1: ~$13/month
- PostgreSQL Flexible B1ms: ~$12/month
- SignalR Free: $0
- Storage: ~$1/month
- **Total: ~$26/month**

**Production (Basic):**
- Static Web App Standard: ~$9/month
- App Service P1V2: ~$85/month
- PostgreSQL D2s_v3: ~$100/month
- SignalR Standard: ~$50/month
- Storage + CDN: ~$10/month
- **Total: ~$254/month**

---

## ⚡ **Deployment Options**

### **Option 1: Terraform (Recommended - Infrastructure as Code)**

**Prerequisites:**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Install Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

**Deploy:**
```bash
# 1. Login to Azure
az login

# 2. Set subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# 3. Navigate to terraform directory
cd azure/terraform

# 4. Initialize Terraform
terraform init

# 5. Create terraform.tfvars
cat > terraform.tfvars <<EOF
environment         = "prod"
location           = "East US"
db_admin_username  = "pgadmin"
db_admin_password  = "YourSecurePassword123!"
google_books_api_key = "your-google-books-api-key"
EOF

# 6. Plan deployment
terraform plan

# 7. Deploy!
terraform apply

# 8. Get outputs
terraform output
```

**Outputs will show:**
- ✅ Backend URL
- ✅ Frontend URL
- ✅ Database connection
- ✅ All service endpoints

---

### **Option 2: Azure Bicep (Native Azure)**

```bash
# 1. Login to Azure
az login

# 2. Create resource group
az group create \
  --name rg-angle-book-club-prod \
  --location eastus

# 3. Deploy Bicep template
az deployment group create \
  --resource-group rg-angle-book-club-prod \
  --template-file azure/bicep/main.bicep \
  --parameters \
    environment=prod \
    dbAdminUsername=pgadmin \
    dbAdminPassword='YourSecurePassword123!' \
    googleBooksApiKey='your-api-key'

# 4. Get outputs
az deployment group show \
  --resource-group rg-angle-book-club-prod \
  --name main \
  --query properties.outputs
```

---

### **Option 3: Azure Portal (Click-Through)**

**Step-by-step guide:**

#### **1. Create Resource Group**
- Portal → Resource groups → Create
- Name: `rg-angle-book-club-prod`
- Region: East US

#### **2. Create PostgreSQL Database**
- Portal → Databases → Azure Database for PostgreSQL
- Deployment option: Flexible server
- Server name: `psql-angle-prod`
- Version: 14
- Compute + storage: Burstable, B1ms (1 vCore, 2 GB RAM)
- Admin username: `pgadmin`
- Password: (secure password)
- Database name: `angle_book_club`

#### **3. Create App Service**
- Portal → App Services → Create
- Name: `app-angle-backend-prod`
- Runtime: Node 18 LTS
- OS: Linux
- Region: East US
- Plan: B1 Basic

**Configure environment variables:**
- Settings → Configuration → Application settings:
  ```
  NODE_ENV=production
  DATABASE_URL=postgresql://...
  JWT_SECRET=(generate random 64-char string)
  GOOGLE_BOOKS_API_KEY=your-key
  ```

**Set startup command:**
- Settings → Configuration → General settings
- Startup Command: `npm run migrate && npm start`

#### **4. Create Static Web App**
- Portal → Static Web Apps → Create
- Name: `swa-angle-prod`
- Region: East US 2
- Deployment: GitHub
- Repository: Select your repo
- Build presets: Custom
- App location: `/`
- Output location: `dist`

**Add environment variables:**
```
VITE_API_URL=https://app-angle-backend-prod.azurewebsites.net/api
VITE_WS_URL=https://app-angle-backend-prod.azurewebsites.net
```

#### **5. Create SignalR Service**
- Portal → SignalR Service → Create
- Name: `signalr-angle-prod`
- Pricing tier: Free
- Service mode: Default

#### **6. Create Storage Account**
- Portal → Storage accounts → Create
- Name: `stangleprod[random]`
- Performance: Standard
- Replication: LRS
- Create container: `uploads` (Blob, public access)

#### **7. Create Key Vault** (Optional but recommended)
- Portal → Key Vaults → Create
- Name: `kv-angle-prod`
- Store all secrets here

#### **8. Application Insights** (Monitoring)
- Portal → Application Insights → Create
- Name: `appi-angle-prod`
- Add connection string to App Service config

---

## 🚀 **GitHub Actions CI/CD (Automated)**

**Setup:**

1. **Get Azure credentials:**
```bash
az ad sp create-for-rbac \
  --name "github-actions-angle" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/rg-angle-book-club-prod \
  --sdk-auth
```

2. **Add GitHub Secrets:**
- Go to repo Settings → Secrets → Actions
- Add:
  - `AZURE_WEBAPP_PUBLISH_PROFILE`: Download from App Service
  - `AZURE_STATIC_WEB_APPS_API_TOKEN`: From Static Web App
  - `VITE_API_URL`: Your backend URL
  - `VITE_WS_URL`: Your backend URL

3. **Push to trigger deployment:**
```bash
git push origin main
```

GitHub Actions will auto-deploy on every push!

---

## 🔧 **Post-Deployment Setup**

### **1. Run Database Migrations**
```bash
# SSH into App Service
az webapp ssh --name app-angle-backend-prod --resource-group rg-angle-book-club-prod

# Or use deployment slot
az webapp deployment source sync \
  --name app-angle-backend-prod \
  --resource-group rg-angle-book-club-prod

# Migrations run automatically on startup
```

### **2. Configure Custom Domain** (Optional)
```bash
# Add custom domain to Static Web App
az staticwebapp hostname set \
  --name swa-angle-prod \
  --resource-group rg-angle-book-club-prod \
  --hostname www.yourdomain.com

# SSL certificate is auto-provisioned
```

### **3. Set up Front Door** (Global CDN)
```bash
az afd profile create \
  --profile-name afd-angle-prod \
  --resource-group rg-angle-book-club-prod \
  --sku Standard_AzureFrontDoor
```

---

## 📊 **Monitoring & Logs**

**View logs:**
```bash
# Backend logs
az webapp log tail \
  --name app-angle-backend-prod \
  --resource-group rg-angle-book-club-prod

# Frontend logs (Static Web App)
# View in Azure Portal → Static Web App → Logs
```

**Application Insights:**
- Portal → Application Insights → appi-angle-prod
- Live Metrics
- Transaction search
- Performance monitoring

---

## 🔒 **Security Best Practices**

1. ✅ Use Key Vault for all secrets
2. ✅ Enable managed identity for App Service
3. ✅ Configure PostgreSQL firewall rules
4. ✅ Enable HTTPS only
5. ✅ Set up Azure AD authentication (optional)
6. ✅ Configure CORS properly
7. ✅ Enable Application Insights
8. ✅ Set up alerts for errors

---

## 🔄 **Scaling**

**Auto-scale App Service:**
```bash
az monitor autoscale create \
  --resource-group rg-angle-book-club-prod \
  --resource app-angle-backend-prod \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale-angle \
  --min-count 1 \
  --max-count 5 \
  --count 1
```

**Scale PostgreSQL:**
```bash
az postgres flexible-server update \
  --resource-group rg-angle-book-club-prod \
  --name psql-angle-prod \
  --sku-name Standard_D2s_v3
```

---

## 🆘 **Troubleshooting**

**Backend won't start:**
```bash
# Check logs
az webapp log tail --name app-angle-backend-prod

# Restart app
az webapp restart --name app-angle-backend-prod
```

**Database connection fails:**
```bash
# Test connection
az postgres flexible-server connect \
  --name psql-angle-prod \
  --admin-user pgadmin
```

**Frontend build fails:**
- Check environment variables in Static Web App configuration
- Verify VITE_API_URL points to correct backend

---

## 💡 **Advanced Features**

### **Add Azure OpenAI** (AI-powered features)
```bash
az cognitiveservices account create \
  --name openai-angle-prod \
  --resource-group rg-angle-book-club-prod \
  --kind OpenAI \
  --sku S0 \
  --location eastus
```

### **Add Azure Cognitive Search** (Better book search)
```bash
az search service create \
  --name search-angle-prod \
  --resource-group rg-angle-book-club-prod \
  --sku basic
```

### **Add Azure Cache for Redis** (Performance)
```bash
az redis create \
  --name redis-angle-prod \
  --resource-group rg-angle-book-club-prod \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

---

## ✅ **Deployment Checklist**

- [ ] Azure subscription active
- [ ] Resource group created
- [ ] PostgreSQL database provisioned
- [ ] App Service configured
- [ ] Static Web App deployed
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] CORS configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] SSL certificates active
- [ ] Custom domain configured (optional)

---

## 🎉 **Your App is Live on Azure!**

**Next steps:**
1. Visit your Static Web App URL
2. Create an account
3. Share books with the world!

**Manage your deployment:**
- Azure Portal: https://portal.azure.com
- Monitor costs: Cost Management
- View metrics: Application Insights
- Scale resources: Auto-scale settings

---

**Total deployment time: 15-30 minutes**  
**Your app is now enterprise-grade, globally distributed, and production-ready!** 🚀☁️
