#!/bin/bash

# 🚀 Azure Deployment Script - The Angle BOOK Club
# Full infrastructure deployment to Microsoft Azure

set -e

echo "☁️  THE ANGLE BOOK CLUB - AZURE DEPLOYMENT"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${YELLOW}⚠️  Azure CLI not found. Installing...${NC}"
    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
fi

echo -e "${GREEN}✅ Azure CLI ready!${NC}"
echo ""

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${YELLOW}⚠️  Terraform not found. Would you like to install it? (y/n)${NC}"
    read -r install_tf
    if [[ $install_tf =~ ^[Yy]$ ]]; then
        wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
        unzip terraform_1.6.0_linux_amd64.zip
        sudo mv terraform /usr/local/bin/
        rm terraform_1.6.0_linux_amd64.zip
    fi
fi

# Login to Azure
echo -e "${BLUE}🔐 Step 1: Login to Azure${NC}"
az login

echo ""
echo -e "${BLUE}📋 Step 2: Select Subscription${NC}"
az account list --output table
echo ""
read -p "Enter subscription ID: " subscription_id
az account set --subscription "$subscription_id"

echo ""
echo -e "${GREEN}✅ Subscription set!${NC}"

# Choose deployment method
echo ""
echo "Choose deployment method:"
echo "  1) Terraform (Infrastructure as Code - Recommended)"
echo "  2) Azure Bicep (Native Azure)"
echo "  3) Manual Portal Setup (Guide only)"
echo ""
read -p "Enter choice (1-3): " deploy_method

if [ "$deploy_method" == "1" ]; then
    # Terraform deployment
    echo ""
    echo -e "${BLUE}🏗️  Deploying with Terraform...${NC}"

    cd azure/terraform

    # Collect variables
    read -p "Environment (prod/dev): " environment
    read -p "Azure Region (eastus/westus/etc): " location
    read -p "Database admin username: " db_user
    read -s -p "Database admin password: " db_pass
    echo ""
    read -p "Google Books API Key (optional): " google_key

    # Create terraform.tfvars
    cat > terraform.tfvars <<EOF
environment          = "$environment"
location            = "$location"
db_admin_username   = "$db_user"
db_admin_password   = "$db_pass"
google_books_api_key = "$google_key"
EOF

    echo ""
    echo -e "${BLUE}Initializing Terraform...${NC}"
    terraform init

    echo ""
    echo -e "${BLUE}Planning deployment...${NC}"
    terraform plan

    echo ""
    read -p "Proceed with deployment? (yes/no): " proceed
    if [ "$proceed" == "yes" ]; then
        terraform apply -auto-approve

        echo ""
        echo -e "${GREEN}=========================================="
        echo "✅ DEPLOYMENT COMPLETE!"
        echo "==========================================${NC}"
        echo ""
        terraform output

        backend_url=$(terraform output -raw backend_url)
        frontend_url=$(terraform output -raw frontend_url)

        echo ""
        echo -e "${GREEN}Your app is LIVE at:${NC}"
        echo -e "${BLUE}Frontend: $frontend_url${NC}"
        echo -e "${BLUE}Backend:  $backend_url${NC}"
    fi

elif [ "$deploy_method" == "2" ]; then
    # Bicep deployment
    echo ""
    echo -e "${BLUE}🏗️  Deploying with Azure Bicep...${NC}"

    read -p "Resource Group name: " rg_name
    read -p "Azure Region: " location
    read -p "Environment (prod/dev): " environment
    read -p "Database admin username: " db_user
    read -s -p "Database admin password: " db_pass
    echo ""
    read -p "Google Books API Key (optional): " google_key

    # Create resource group
    echo ""
    echo -e "${BLUE}Creating resource group...${NC}"
    az group create --name "$rg_name" --location "$location"

    # Deploy Bicep template
    echo ""
    echo -e "${BLUE}Deploying infrastructure...${NC}"
    az deployment group create \
      --resource-group "$rg_name" \
      --template-file azure/bicep/main.bicep \
      --parameters \
        environment="$environment" \
        dbAdminUsername="$db_user" \
        dbAdminPassword="$db_pass" \
        googleBooksApiKey="$google_key"

    echo ""
    echo -e "${GREEN}=========================================="
    echo "✅ DEPLOYMENT COMPLETE!"
    echo "==========================================${NC}"

    # Get outputs
    az deployment group show \
      --resource-group "$rg_name" \
      --name main \
      --query properties.outputs

else
    # Manual setup guide
    echo ""
    echo -e "${YELLOW}📖 Manual Setup Guide${NC}"
    echo ""
    echo "Please follow the instructions in AZURE_DEPLOYMENT.md"
    echo "for step-by-step portal setup."
    echo ""
    echo "Opening documentation..."
    cat AZURE_DEPLOYMENT.md | less
fi

echo ""
echo ""
echo -e "${GREEN}=========================================="
echo "🎉 AZURE DEPLOYMENT COMPLETE!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Visit your frontend URL"
echo "  2. Create an account"
echo "  3. Start sharing books!"
echo ""
echo "Useful Azure CLI commands:"
echo "  - View logs: az webapp log tail --name <app-name> --resource-group <rg>"
echo "  - Restart app: az webapp restart --name <app-name> --resource-group <rg>"
echo "  - Open portal: az portal"
echo ""
echo "Monitoring:"
echo "  - Portal: https://portal.azure.com"
echo "  - Cost Management: https://portal.azure.com/#blade/Microsoft_Azure_CostManagement"
echo ""
