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