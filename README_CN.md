# ip-cert-ca - 内网IP地址HTTPS证书管理系统

**中文** | [English](README.md)

## 项目简介

ip-cert-ca 是一个轻量级的证书颁发机构(CA)系统，专门为内网环境中的IP地址生成和管理SSL/TLS证书。该系统基于Node.js构建，使用node-forge库进行证书生成，提供简单易用的Web界面和API接口。

## 快速开始

### 安装和运行

#### 方式一：使用 npx 直接运行（推荐）

```bash
npx ip-cert-ca
```

#### 方式二：生产环境部署（使用 PM2）

创建 `ecosystem.config.cjs` 配置文件：

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

然后使用 PM2 启动：

```bash
  npx pm2 start ecosystem.config.cjs
```

#### 方式三：从源码运行

```bash
git clone https://github.com/seeker-wen/ip-cert-ca.git
cd ip-cert-ca
npm install
npm run prod
```

## 功能特性

- 🔐 自动生成根证书和私钥
- 🌐 专门为IP地址签发SSL证书
- 🚀 简单易用的Web界面
- 📡 RESTful API接口
- 🐳 支持Docker容器化部署
- ⚡ 轻量级，资源占用少

## API 接口

### 获取根证书

```http
GET /api/cert/root
```

### 签发IP证书

```http
POST /api/cert/sign
Content-Type: application/json

{
  "ip": "192.168.1.100"
}
```

## 目标读者

- IT 安全人员
- 网络管理员
- 开发人员
- 任何需要了解内部 HTTPS 证书管理的人

## 背景与目的

在企业内部环境中，有时我们需要为没有域名的服务提供 HTTPS 加密连接。这通常是因为这些服务只在局域网内运行，或者出于成本和管理方面的考虑不需要注册公开域名。

为了满足这一需求，我们开发了一个基于 B/S 架构的内部 HTTPS 证书管理系统。通过这个系统，我们可以轻松地为内部服务签发和管理 HTTPS 证书，确保数据传输的安全性。

## 工作原理

### 根证书

- **定义**：根证书是一张特殊的证书，用于信任其他证书。
- **生成**：系统会自动生成一个根证书，并允许用户下载安装。
- **安装**：用户需要将根证书安装在他们的设备上（如电脑或移动设备）。

### ⚠️ 安全警告 根证书私钥的重要性

**根证书私钥 (`root_ca.key`) 是整个证书体系的核心**：

- 🔐 **绝对保密**：任何人获得此私钥都可以签发被您系统信任的证书
- 🚫 **不可泄露**：一旦泄露，攻击者可以伪造任何域名/IP的证书
- 💾 **安全备份**：建议将私钥备份到安全的离线存储设备
- 🔒 **访问控制**：确保只有授权人员可以访问此文件

### IP 证书

- **申请**：在系统中输入需要保护的服务的 IP 地址，系统会自动为该 IP 生成一张证书。
- **签发**：生成的证书由上述的根证书进行签名，证明其有效性。
- **部署**：将签发好的证书部署到服务器上，以启用 HTTPS。

## 如何使用

### 下载并安装根证书

- 访问我们的证书管理系统网站。
- 下载根证书文件。
- 直接双击该文件来启动安装过程。会打开一个证书导入向导，选择将证书放置到*受信任的根证书颁发机构*或*受信任的发布者存储*

### 申请 IP 证书

- 登录证书管理系统。
- 输入需要保护的服务的 IP 地址。
- 系统会自动生成一张 IP 证书供下载。

### 配置 Nginx 服务器

#### 步骤 1: 备份现有配置

- 在开始前，请先备份现有的 Nginx 配置文件。
- 通常配置文件位于 `/etc/nginx/nginx.conf` 或 `/etc/nginx/sites-available/` 中。

#### 步骤 2: 编辑配置文件

- 找到需要启用 HTTPS 的服务的配置部分。
- 添加以下内容：

  ```nginx
  server {
      listen 443 ssl;
      server_name <IP地址>;

      ssl_certificate /path/to/cert.pem; # 证书路径
      ssl_certificate_key /path/to/key.pem; # 私钥路径

      # 其他 SSL 设置...

      location / {
          # 服务配置...
      }
  }
  ```
