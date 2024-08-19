import fs from 'fs-extra';
import selfsigned from 'selfsigned';
import config from "../config.js";

// 生成根证书
async function generateRootCertificate({
  key,
  cert,
  days,
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

  const pems = selfsigned.generate(rootAttrs, {
    keySize: 4096,
    days,
    algorithm: 'sha256',
    extensions: [
      { name: 'basicConstraints', cA: true }, // 设为CA
      { name: 'keyUsage', keyCertSign: true, cRLSign: true }, // 允许签署证书和CRL
      { name: 'subjectKeyIdentifier' }
    ],
    clientCertificate: false
  });

  // 保存根证书的私钥和证书
  await fs.outputFile(key, pems.private);
  await fs.outputFile(cert, pems.cert);
}


async function start() {
  if (!fs.existsSync(config.cert.rootCA.key) || !fs.existsSync(config.cert.rootCA.cert)) {
    await generateRootCertificate({
      key: config.cert.rootCA.key,
      cert: config.cert.rootCA.cert,
      days: config.cert.rootCA.days,
      commonName: config.cert.rootCA.commonName,
      countryName: config.cert.rootCA.countryName,
      stateOrProvinceName: config.cert.rootCA.stateOrProvinceName,
      localityName: config.cert.rootCA.localityName,
      organizationName: config.cert.rootCA.organizationName,
      organizationalUnitName: config.cert.rootCA.organizationalUnitName,
    })
  }

  await import('../app.js');
}

start();