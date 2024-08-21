import fs from 'fs-extra';
import forge from 'node-forge';
import config from "../config.js";

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
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + years);
  cert.setSubject(rootAttrs);
  cert.setIssuer(rootAttrs);

  cert.setExtensions([
    { name: 'basicConstraints', cA: true },
    { name: 'keyUsage', keyCertSign: true, digitalSignature: true, cRLSign: true },
    { name: 'subjectKeyIdentifier' }
  ]);

  cert.sign(keys.privateKey, forge.md.sha256.create());

  // 将证书和私钥保存为文件
  const pemCert = forge.pki.certificateToPem(cert);
  const pemPrivateKey = forge.pki.privateKeyToPem(keys.privateKey);

  return {
    pemCert,
    pemPrivateKey
  }
}


async function start() {
  if (!fs.existsSync(config.cert.rootCA.key) || !fs.existsSync(config.cert.rootCA.cert)) {
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
    await fs.outputFile(config.cert.rootCA.key, pemPrivateKey);
    await fs.outputFile(config.cert.rootCA.cert, pemCert);
  }

  await import('../app.js');
}

start();