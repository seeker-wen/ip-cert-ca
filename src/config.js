import 'dotenv/config';
import fs from 'fs-extra';
import path from 'path';

const env = process.env;

export const server = {
  host: env.SERVER_HOST || '0.0.0.0',
  port: +env.SERVER_PORT || 9999,
  get ssl() {
    // 延迟加载SSL证书，确保证书文件已经生成
    return {
      key: fs.readFileSync(path.join(process.cwd(), './ssl/server.key')),
      cert: fs.readFileSync(path.join(process.cwd(), './ssl/server.crt')),
    };
  },
};

export const cert = {
  rootCA: {
    keyfile: path.join(process.cwd(), './ca/root_ca.key'),
    certfile: path.join(process.cwd(), './ca/root_ca.crt'),
    years: +env.ROOT_CA_YEARS || 100,
    commonName: env.ROOT_CA_COMMON_NAME || 'IP-Cert-CA-Root',
    countryName: env.ROOT_CA_COUNTRY_NAME || 'CN',
    stateOrProvinceName: env.ROOT_CA_STATE_OR_PROVINCENAME || 'HuBei',
    localityName: env.ROOT_CA_LOCALITY_NAME || 'WuHan',
    organizationName: env.ROOT_CA_ORGANIZATION_NAME || 'IP-Cert-CA',
    organizationalUnitName:
      env.ROOT_CA_ORGANIZATIONAL_UNIT_NAME || 'IP-Cert-CA',
  },
  signCert: {
    years: +env.SIGN_CERT_YEARS || 10,
    countryName: env.SIGN_CERT_COUNTRY_NAME || 'CN',
    stateOrProvinceName: env.SIGN_CERT_STATE_OR_PROVINCENAME || 'HuBei',
    localityName: env.SIGN_CERT_LOCALITY_NAME || 'WuHan',
    organizationName: env.SIGN_CERT_ORGANIZATION_NAME || 'IP-Cert-CA',
    organizationalUnitName:
      env.SIGN_CERT_ORGANIZATIONAL_UNIT_NAME || 'IP-Cert-CA',
  },
};

export default {
  server,
  cert,
};
