import fs from 'fs-extra';
import forge from 'node-forge';

import { CustomError } from "../error.js";
import { cert } from "../config.js";


// 生成 IP 地址证书
function generateIpCertificate({ rootPemCert, rootPemKey }, {
  ip,
  years,
  countryName,
  stateOrProvinceName,
  localityName,
  organizationName,
  organizationalUnitName,
} = {}) {
  const rootCertificate = forge.pki.certificateFromPem(rootPemCert);
  const rootPrivateKey = forge.pki.privateKeyFromPem(rootPemKey);

  const keys = forge.pki.rsa.generateKeyPair(2048);

  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;

  cert.serialNumber = new Date().getTime().toString(16);
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + years);

  cert.setSubject([
    { name: 'commonName', value: ip },
    { name: 'countryName', value: countryName },
    { name: 'stateOrProvinceName', value: stateOrProvinceName },
    { name: 'localityName', value: localityName },
    { name: 'organizationName', value: organizationName },
    { name: 'organizationalUnitName', value: organizationalUnitName },
  ]);
  cert.setIssuer(rootCertificate.subject.attributes);

  cert.setExtensions([
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
    { name: 'subjectAltName', altNames: [{ type: 7, ip: ip }] }
  ]);

  cert.sign(rootPrivateKey, forge.md.sha256.create());

  return {
    rootPemCert,
    pemCert: forge.pki.certificateToPem(cert),
    pemPrivateKey: forge.pki.privateKeyToPem(keys.privateKey)
  };
}

export async function signCert({ ip }) {
  if (!ip) {
    throw new CustomError("ip 不能为空");
  }

  if (!ip.match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
    throw new CustomError("ip 不符合规则，仅支持IPv4。示例 10.12.137.14");
  }
  const rootKey = await fs.readFile(cert.rootCA.key, 'utf8');
  const rootCert = await fs.readFile(cert.rootCA.cert, 'utf8');

  const ipCert = generateIpCertificate(
    {
      rootPemCert: rootCert,
      rootPemKey: rootKey,
    },
    {
      ip,
      years: cert.signCert.years,
      countryName: cert.signCert.countryName,
      stateOrProvinceName: cert.signCert.stateOrProvinceName,
      localityName: cert.signCert.localityName,
      organizationName: cert.signCert.organizationName,
      organizationalUnitName: cert.signCert.organizationalUnitName,
    });

  return {
    key: ipCert.pemPrivateKey,
    cert: ipCert.pemCert,
    ca: rootCert
  }
}

export async function getRootCert() {
  const rootCert = await fs.readFile(cert.rootCA.cert, 'utf8');
  return {
    cert: rootCert
  }
}