const env = process.env;

export const server = {
  port: 3000,
  ssl: {
    key: 'key.pem',
    cert: 'cert.pem'
  },
}

export const cert = {
  store: './var/store.json',
  rootCA: {
    key: './var/root_ca.key',
    cert: './var/root_ca.crt',
    years: env.ROOT_CA_YEARS || 100,
    commonName: env.ROOT_CA_COMMON_NAME || "OmegaCARoot",
    countryName: env.ROOT_CA_COUNTRY_NAME || "CN",
    stateOrProvinceName: env.ROOT_CA_STATE_OR_PROVINCENAME || "HuBei",
    localityName: env.ROOT_CA_LOCALITY_NAME || "WuHan",
    organizationName: env.ROOT_CA_ORGANIZATION_NAME || "OmegaCA",
    organizationalUnitName: env.ROOT_CA_ORGANIZATIONAL_UNIT_NAME || "OmegaCA",
  },
  signCert: {
    years: env.SIGN_CERT_YEARS || 10,
    commonName: env.SIGN_CERT_COMMON_NAME || "OmegaCA",
    countryName: env.SIGN_CERT_COUNTRY_NAME || "CN",
    stateOrProvinceName: env.SIGN_CERT_STATE_OR_PROVINCENAME || "HuBei",
    localityName: env.SIGN_CERT_LOCALITY_NAME || "WuHan",
    organizationName: env.SIGN_CERT_ORGANIZATION_NAME || "OmegaCA",
    organizationalUnitName: env.SIGN_CERT_ORGANIZATIONAL_UNIT_NAME || "OmegaCA",
  },
}

export default {
  server,
  cert,
}