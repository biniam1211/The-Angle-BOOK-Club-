# Azure Bicep Deployment Template
# Alternative to Terraform - native Azure IaC

param location string = 'eastus'
param environment string = 'prod'
param dbAdminUsername string = 'pgadmin'
@secure()
param dbAdminPassword string
param googleBooksApiKey string = ''

var resourcePrefix = 'angle-${environment}'
var uniqueSuffix = uniqueString(resourceGroup().id)

// PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: 'psql-${resourcePrefix}-${uniqueSuffix}'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: dbAdminUsername
    administratorLoginPassword: dbAdminPassword
    version: '14'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
  }
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  parent: postgresServer
  name: 'angle_book_club'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Storage Account
resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'stangle${environment}${uniqueSuffix}'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource uploadsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'uploads'
  properties: {
    publicAccess: 'Blob'
  }
}

// SignalR Service
resource signalr 'Microsoft.SignalRService/signalR@2023-02-01' = {
  name: 'signalr-${resourcePrefix}'
  location: location
  sku: {
    name: 'Free_F1'
    capacity: 1
  }
  properties: {
    features: [
      {
        flag: 'ServiceMode'
        value: 'Default'
      }
    ]
    cors: {
      allowedOrigins: ['*']
    }
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-02-01' = {
  name: 'kv-${resourcePrefix}-${uniqueSuffix}'
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    accessPolicies: []
  }
}

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: 'asp-${resourcePrefix}'
  location: location
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

// Backend App Service
resource backendApp 'Microsoft.Web/sites@2022-09-01' = {
  name: 'app-${resourcePrefix}-backend'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      alwaysOn: true
      appCommandLine: 'npm run migrate && npm start'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'DATABASE_URL'
          value: 'postgresql://${dbAdminUsername}:${dbAdminPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/${postgresDatabase.name}?sslmode=require'
        }
        {
          name: 'JWT_SECRET'
          value: uniqueString(resourceGroup().id, 'jwt')
        }
        {
          name: 'GOOGLE_BOOKS_API_KEY'
          value: googleBooksApiKey
        }
        {
          name: 'AZURE_STORAGE_CONNECTION_STRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};AccountKey=${listKeys(storageAccount.id, storageAccount.apiVersion).keys[0].value};EndpointSuffix=core.windows.net'
        }
        {
          name: 'SIGNALR_CONNECTION_STRING'
          value: listKeys(signalr.id, signalr.apiVersion).primaryConnectionString
        }
      ]
    }
  }
}

// Static Web App (Frontend)
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: 'swa-${resourcePrefix}'
  location: 'eastus2'
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: '/'
      apiLocation: ''
      outputLocation: 'dist'
    }
  }
}

// Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-${resourcePrefix}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'Node.JS'
  }
}

// Outputs
output backendUrl string = 'https://${backendApp.properties.defaultHostName}'
output frontendUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output databaseHost string = postgresServer.properties.fullyQualifiedDomainName
output storageAccountName string = storageAccount.name
