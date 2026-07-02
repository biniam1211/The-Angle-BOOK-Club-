variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "East US"
}

variable "db_admin_username" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "pgadmin"
}

variable "db_admin_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}

variable "google_books_api_key" {
  description = "Google Books API key"
  type        = string
  default     = ""
}
