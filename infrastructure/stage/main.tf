# Variables
variable "VULTR_API_KEY" {
  description = "The Vultr API Key"
}

variable "INSTANCE_NAME" {
  description = "The name of the project this instance is for"
}

variable "INSTANCE_ENV" {
  description = "The environment this project will be running"
  default = "prod"
}

variable "INSTANCE_LOCATION" {
  description = "The location all instances will be generated in"
  default = "lhr"
}

# Providers
terraform {
  required_providers {
    vultr = {
        source = "vultr/vultr"
        version = "2.17.1"
    }
  }
}

provider "vultr" {
  api_key = var.VULTR_API_KEY
  rate_limit = 100
  retry_limit = 3
}

# Resources
resource "vultr_instance" "vps-app" {
    label = "vps-${var.INSTANCE_NAME}-${var.INSTANCE_ENV}-${var.INSTANCE_LOCATION}-app"
    hostname = "vps-${var.INSTANCE_NAME}-${var.INSTANCE_ENV}-${var.INSTANCE_LOCATION}-app"
    plan = "vc2-1c-1gb"
    region = var.INSTANCE_LOCATION
    os_id = "2136"
    enable_ipv6 = false
    user_data = file("./cloud-config.yml")
}

resource "vultr_reserved_ip" "ip-app" {
  region = var.INSTANCE_LOCATION
  ip_type = "v4"
  instance_id = "${vultr_instance.vps-app.id}"
}

# Outputs
output "instance_ip" {
    value = vultr_instance.vps-app.main_ip
}