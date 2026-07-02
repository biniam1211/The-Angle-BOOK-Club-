# Azure Full Deployment - Infrastructure as Code

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-angle-book-club-${var.environment}"
  location = var.location

  tags = {
    Environment = var.environment
    Application = "AngleBookClub"
    ManagedBy   = "Terraform"
  }
}

# ============================================
# DATABASE - PostgreSQL Flexible Server
# ============================================

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "psql-angle-book-club-${var.environment}"
  resource_group_name    = azurerm_resource_group.main.name
  location              = azurerm_resource_group.main.location
  version               = "14"

  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password

  storage_mb            = 32768
  sku_name             = "B_Standard_B1ms"

  backup_retention_days = 7
  geo_redundant_backup_enabled = false

  tags = azurerm_resource_group.main.tags
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "angle_book_club"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "utf8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# ============================================
# KEY VAULT - Secrets Management
# ============================================

resource "azurerm_key_vault" "main" {
  name                = "kv-angle-${var.environment}-${random_string.suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id          = data.azurerm_client_config.current.tenant_id

  sku_name = "standard"

  purge_protection_enabled   = false
  soft_delete_retention_days = 7

  tags = azurerm_resource_group.main.tags
}

resource "azurerm_key_vault_secret" "jwt_secret" {
  name         = "jwt-secret"
  value        = random_password.jwt_secret.result
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "db_connection_string" {
  name  = "database-url"
  value = "postgresql://${var.db_admin_username}:${var.db_admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.main.name}?sslmode=require"
  key_vault_id = azurerm_key_vault.main.id
}

# ============================================
# STORAGE - Blob Storage for uploads
# ============================================

resource "azurerm_storage_account" "main" {
  name                     = "stangle${var.environment}${random_string.suffix.result}"
  resource_group_name      = azurerm_resource_group.main.name
  location                = azurerm_resource_group.main.location
  account_tier            = "Standard"
  account_replication_type = "LRS"

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "POST", "PUT"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }

  tags = azurerm_resource_group.main.tags
}

resource "azurerm_storage_container" "uploads" {
  name                  = "uploads"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}

# ============================================
# SIGNALR SERVICE - Real-time messaging
# ============================================

resource "azurerm_signalr_service" "main" {
  name                = "signalr-angle-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  sku {
    name     = "Free_F1"
    capacity = 1
  }

  service_mode = "Default"

  cors {
    allowed_origins = ["*"]
  }

  tags = azurerm_resource_group.main.tags
}

# ============================================
# APP SERVICE PLAN - Backend hosting
# ============================================

resource "azurerm_service_plan" "main" {
  name                = "asp-angle-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type            = "Linux"
  sku_name           = "B1"

  tags = azurerm_resource_group.main.tags
}

# ============================================
# APP SERVICE - Backend API
# ============================================

resource "azurerm_linux_web_app" "backend" {
  name                = "app-angle-backend-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true

    application_stack {
      node_version = "18-lts"
    }

    app_command_line = "npm run migrate && npm start"
  }

  app_settings = {
    "NODE_ENV"                      = "production"
    "DATABASE_URL"                  = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.db_connection_string.id})"
    "JWT_SECRET"                    = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.jwt_secret.id})"
    "FRONTEND_URL"                  = "https://${azurerm_static_site.frontend.default_host_name}"
    "GOOGLE_BOOKS_API_KEY"         = var.google_books_api_key
    "AZURE_STORAGE_CONNECTION_STRING" = azurerm_storage_account.main.primary_connection_string
    "SIGNALR_CONNECTION_STRING"    = azurerm_signalr_service.main.primary_connection_string
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = azurerm_application_insights.main.connection_string
  }

  identity {
    type = "SystemAssigned"
  }

  tags = azurerm_resource_group.main.tags
}

# ============================================
# STATIC WEB APP - Frontend
# ============================================

resource "azurerm_static_site" "frontend" {
  name                = "swa-angle-${var.environment}"
  location            = "eastus2"
  resource_group_name = azurerm_resource_group.main.name
  sku_tier           = "Free"
  sku_size           = "Free"

  tags = azurerm_resource_group.main.tags
}

# ============================================
# APPLICATION INSIGHTS - Monitoring
# ============================================

resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-angle-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                = "PerGB2018"
  retention_in_days  = 30

  tags = azurerm_resource_group.main.tags
}

resource "azurerm_application_insights" "main" {
  name                = "appi-angle-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "Node.JS"

  tags = azurerm_resource_group.main.tags
}

# ============================================
# REDIS CACHE - Optional performance boost
# ============================================

resource "azurerm_redis_cache" "main" {
  name                = "redis-angle-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  capacity           = 0
  family             = "C"
  sku_name           = "Basic"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"

  tags = azurerm_resource_group.main.tags
}

# ============================================
# FRONT DOOR - Global CDN + WAF
# ============================================

resource "azurerm_cdn_frontdoor_profile" "main" {
  name                = "afd-angle-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  sku_name           = "Standard_AzureFrontDoor"

  tags = azurerm_resource_group.main.tags
}

# ============================================
# HELPER RESOURCES
# ============================================

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

data "azurerm_client_config" "current" {}

# ============================================
# OUTPUTS
# ============================================

output "backend_url" {
  value = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "frontend_url" {
  value = "https://${azurerm_static_site.frontend.default_host_name}"
}

output "database_host" {
  value = azurerm_postgresql_flexible_server.main.fqdn
}

output "signalr_endpoint" {
  value = azurerm_signalr_service.main.hostname
}

output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "application_insights_key" {
  value     = azurerm_application_insights.main.instrumentation_key
  sensitive = true
}
