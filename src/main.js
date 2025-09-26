#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import forge from 'node-forge';
import config from './config.js';
import { signCert } from './cert.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 生成根证书
async function generateRootCertificate({
  years,
  commonName,
  countryName,
  stateOrProvinceName,
  localityName,
  organizationName,
  organizationalUnitName,
} = {}) {
  const rootAttrs = [
    { name: 'commonName', value: commonName },
    { name: 'countryName', value: countryName },
    { name: 'stateOrProvinceName', value: stateOrProvinceName },
    { name: 'localityName', value: localityName },
    { name: 'organizationName', value: organizationName },
    { name: 'organizationalUnitName', value: organizationalUnitName },
  ];
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();

  cert.publicKey = keys.publicKey;

  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(
    cert.validity.notBefore.getFullYear() + years,
  );
  cert.setSubject(rootAttrs);
  cert.setIssuer(rootAttrs);

  cert.setExtensions([
    { name: 'basicConstraints', cA: true },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      cRLSign: true,
    },
    { name: 'subjectKeyIdentifier' },
  ]);

  cert.sign(keys.privateKey, forge.md.sha256.create());

  // 将证书和私钥保存为文件
  const pemCert = forge.pki.certificateToPem(cert);
  const pemPrivateKey = forge.pki.privateKeyToPem(keys.privateKey);

  return {
    pemCert,
    pemPrivateKey,
  };
}

// 检查并创建环境配置文件
async function ensureEnvFile() {
  const currentEnvPath = path.join(process.cwd(), '.env');
  const templateEnvPath = path.join(__dirname, '..', '.env');

  if (!fs.existsSync(currentEnvPath)) {
    if (fs.existsSync(templateEnvPath)) {
      console.log('当前目录下没有.env文件，正在从模板创建...');
      await fs.copy(templateEnvPath, currentEnvPath);
      console.log('.env文件已创建');
    } else {
      console.log('⚠️ 警告：模板.env文件不存在，将使用默认配置');
    }
  }
}

// 检查并创建PM2配置文件示例
async function ensurePM2ConfigExample() {
  const pm2ConfigPath = path.join(process.cwd(), 'ecosystem.config.js.example');

  if (!fs.existsSync(pm2ConfigPath)) {
    const pm2ConfigContent = `module.exports = {
  apps: [
    {
      name: 'ip-cert-ca',
      script: 'npx',
      args: 'ip-cert-ca',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};`;

    await fs.outputFile(pm2ConfigPath, pm2ConfigContent);
    console.log('PM2配置示例文件已创建: ecosystem.config.js.example');
  }
}

// 检查并生成根CA证书
async function ensureRootCA() {
  if (
    !fs.existsSync(config.cert.rootCA.keyfile) ||
    !fs.existsSync(config.cert.rootCA.certfile)
  ) {
    console.log('根CA证书不存在，正在自动生成...');

    const { pemCert, pemPrivateKey } = await generateRootCertificate({
      years: config.cert.rootCA.years,
      commonName: config.cert.rootCA.commonName,
      countryName: config.cert.rootCA.countryName,
      stateOrProvinceName: config.cert.rootCA.stateOrProvinceName,
      localityName: config.cert.rootCA.localityName,
      organizationName: config.cert.rootCA.organizationName,
      organizationalUnitName: config.cert.rootCA.organizationalUnitName,
    });

    // 保存根证书的私钥和证书
    await fs.outputFile(config.cert.rootCA.keyfile, pemPrivateKey);
    await fs.outputFile(config.cert.rootCA.certfile, pemCert);

    console.log(`根CA证书已生成，CN: ${config.cert.rootCA.commonName}`);
  } else {
    console.log('根CA证书已存在');
  }
}

// 生成SSL服务器证书
async function generateServerCert() {
  console.log(`为 HOST ${config.server.host} 重新生成SSL服务器证书...`);

  // 确保ssl目录存在
  await fs.ensureDir('./ssl');

  // 使用配置中的host作为IP地址生成证书
  const host = config.server.host;

  // 如果host是0.0.0.0，则使用127.0.0.1作为证书IP
  const certIP = host === '0.0.0.0' ? '127.0.0.1' : host;

  try {
    const { cert, key } = await signCert({ ip: certIP });

    // 保存服务器证书和私钥
    await fs.outputFile('./ssl/server.key', key);
    await fs.outputFile('./ssl/server.crt', cert);

    console.log(`SSL服务器证书已生成，IP: ${certIP}`);
  } catch (error) {
    console.error('❌ 生成SSL服务器证书失败:', error.message);
    process.exit(1);
  }
}

async function init() {
  // 初始化环境配置
  await ensureEnvFile();
  // 创建PM2配置示例文件
  await ensurePM2ConfigExample();
  // 确保根CA证书存在
  await ensureRootCA();
  // 生成SSL服务器证书
  await generateServerCert();
  // 启动应用
  await import('./app.js');
}

init()
  .then(() => {
    console.log('🎉 应用初始化完成');
  })
  .catch((error) => {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  });
