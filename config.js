import path from "path";

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
    days: 36500,
    commonName: "OmegaCARoot",
    countryName: "CN",
    stateOrProvinceName: "HuBei",
    localityName: "WuHan",
    organizationName: "OmegaCA",
    organizationalUnitName: "OmegaCA",
  }
}

export default {
  server,
  cert,
}