# Providers
terraform {
  required_providers {
    vultr = {
        source = "vultr/vultr"
        version = "2.16.1"
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
    backups = "enabled"
    backups_schedule {
      type = "daily"
      hour = 1
    }
    activation_email = false
}

# Outputs
output "instance_ip" {
    value = vultr_instance.vps-app.main_ip
}