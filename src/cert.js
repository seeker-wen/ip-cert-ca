import fs from 'fs-extra';
import selfsigned from 'selfsigned';

import { CustomError } from "../error.js";
import { cert } from "../config.js";


// 生成 IP 地址证书
function generateIpCertificate({ ipAddress, rootKeys, rootCert }) {
  const ipAttrs = [
    { name: 'commonName', value: ipAddress },
    { name: 'countryName', value: 'US' },
    { name: 'stateOrProvinceName', value: 'California' },
    { name: 'localityName', value: 'San Francisco' },
    { name: 'organizationName', value: 'My Company' },
    { name: 'organizationalUnitName', value: 'My Department' },
  ];

  const ipCert = selfsigned.generate(ipAttrs, {
    days: 3650,
    extensions: [
      { name: 'basicConstraints', cA: false },
      { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
      { name: 'extKeyUsage', serverAuth: true, clientAuth: true },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 7 /* IP */, ip: ipAddress }
        ],
      },
      { name: 'subjectKeyIdentifier' },
      { name: 'authorityKeyIdentifier' },
    ],
    signingKey: rootKeys,
    signingCert: rootCert,
  });

  return ipCert;
}

export async function signCert({ ip }) {
  if (!ip) {
    throw new CustomError("ip 不能为空");
  }

  if (!ip.match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
    throw new CustomError("ip 不符合规则");
  }
  const rootKeys = await fs.readFile(cert.rootCA.key, 'utf8');
  const rootCert = await fs.readFile(cert.rootCA.cert, 'utf8');

  const ipCert = generateIpCertificate({
    ipAddress: ip,
    rootKeys,
    rootCert
  });

  return {
    key: ipCert.private,
    cert: ipCert.cert,
    ca: rootCert
  }
}

export async function getRootCert() {
  const rootCert = await fs.readFile(cert.rootCA.cert, 'utf8');
  return {
    cert: rootCert
  }
}