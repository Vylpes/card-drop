# Variables
variable "VULTR_API_KEY" {
  description = "The Vultr API Key"
}

variable "INSTANCE_PREFIX" {
  description = "The prefix to be added before instance labels"
}

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
    label = "${var.INSTANCE_PREFIX}-ldn-vps-app"
    hostname = "${var.INSTANCE_PREFIX}-ldn-vps-app"
    plan = "vc2-1c-1gb"
    region = "lhr"
    os_id = "2136"
    enable_ipv6 = false
    user_data = file("./cloud-config.yml")
}

resource "vultr_reserved_ip" "ip-app" {
  region = "lhr"
  ip_type = "v4"
  instance_id = "${vultr_instance.vps-app.id}"
}

# Outputs
output "instance_ip" {
    value = vultr_instance.vps-app.main_ip
}