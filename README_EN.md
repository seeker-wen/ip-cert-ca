# ip-cert-ca - Internal IP Address HTTPS Certificate Management System

[中文版](README.md) | **English**

## Project Overview

ip-cert-ca is a lightweight Certificate Authority (CA) system specifically designed for generating and managing SSL/TLS certificates for IP addresses in internal network environments. Built on Node.js and using the node-forge library for certificate generation, it provides an easy-to-use web interface and API endpoints.

## Quick Start

### Installation and Running

#### Method 1: Direct execution with npx (Recommended)

```bash
npx ip-cert-ca
```

#### Method 2: Production deployment (Using PM2)

Create an `ecosystem.config.cjs` configuration file:

```javascript
module.exports = {
  apps: [
    {
      name: 'ip-cert-ca',
      script: 'npx ip-cert-ca',
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
      error_file: './err.log',
      out_file: './out.log',
      log_file: './combined.log',
      time: true,
    },
  ],
};
```

Then start with PM2:

```bash
  npx pm2 start ecosystem.config.cjs
```

#### Method 3: Run from source code

```bash
git clone https://github.com/your-repo/ip-cert-ca.git
cd ip-cert-ca
npm install
npm run prod
```

## Features

- 🔐 Automatic generation of root certificates and private keys
- 🌐 Specialized SSL certificate issuance for IP addresses
- 🚀 Simple and user-friendly web interface
- 📡 RESTful API endpoints
- 🐳 Docker containerization support
- ⚡ Lightweight with minimal resource usage

## API Endpoints

### Get Root Certificate

```http
GET /api/cert/root
```

### Issue IP Certificate

```http
POST /api/cert/sign
Content-Type: application/json

{
  "ip": "192.168.1.100"
}
```

## Target Audience

- IT Security Personnel
- Network Administrators
- Developers
- Anyone who needs to understand internal HTTPS certificate management

## Background and Purpose

In enterprise internal environments, we sometimes need to provide HTTPS encrypted connections for services without domain names. This is usually because these services only run within the local area network, or for cost and management considerations, there's no need to register public domain names.

To meet this need, we developed a B/S architecture-based internal HTTPS certificate management system. Through this system, we can easily issue and manage HTTPS certificates for internal services, ensuring the security of data transmission.

## How It Works

### Root Certificate

- **Definition**: A root certificate is a special certificate used to trust other certificates.
- **Generation**: The system automatically generates a root certificate and allows users to download and install it.
- **Installation**: Users need to install the root certificate on their devices (such as computers or mobile devices).

### ⚠️ Security Warning - Importance of Root Certificate Private Key

**The root certificate private key (`root_ca.key`) is the core of the entire certificate system**:

- 🔐 **Absolute Confidentiality**: Anyone who obtains this private key can issue certificates trusted by your system
- 🚫 **Must Not Be Leaked**: Once leaked, attackers can forge certificates for any domain/IP
- 💾 **Secure Backup**: It's recommended to backup the private key to secure offline storage devices
- 🔒 **Access Control**: Ensure only authorized personnel can access this file

### IP Certificates

- **Application**: Enter the IP address of the service that needs protection in the system, and the system will automatically generate a certificate for that IP.
- **Issuance**: The generated certificate is signed by the aforementioned root certificate, proving its validity.
- **Deployment**: Deploy the issued certificate to the server to enable HTTPS.

## How to Use

### Download and Install Root Certificate

- Visit our certificate management system website.
- Download the root certificate file.
- Double-click the file directly to start the installation process. This will open a certificate import wizard, choose to place the certificate in _Trusted Root Certification Authorities_ or _Trusted Publishers store_

### Apply for IP Certificate

- Log in to the certificate management system.
- Enter the IP address of the service that needs protection.
- The system will automatically generate an IP certificate for download.

### Configure Nginx Server

#### Step 1: Backup Existing Configuration

- Before starting, please backup your existing Nginx configuration files.
- Configuration files are usually located in `/etc/nginx/nginx.conf` or `/etc/nginx/sites-available/`.

#### Step 2: Edit Configuration File

- Find the configuration section for the service that needs HTTPS enabled.
- Add the following content:

  ```nginx
  server {
      listen 443 ssl;
      server_name <IP_ADDRESS>;

      ssl_certificate /path/to/cert.pem; # Certificate path
      ssl_certificate_key /path/to/key.pem; # Private key path

      # Other SSL settings...

      location / {
          # Service configuration...
      }
  }
  ```
