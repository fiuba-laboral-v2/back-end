import { Environment } from "$config/Environment";

const endpoints = {
  company: {
    offer: (uuid: string) => `empresa/ofertas/${uuid}`,
    applicant: (uuid: string) => `empresa/postulantes/${uuid}`
  }
};

export const FrontendConfig = {
  production: {
    baseUrl: "http://laboral.fi.uba.ar",
    subDomain: "laboral/#",
    endpoints
  },
  staging: {
    baseUrl: "http://antiguos.fi.uba.ar",
    subDomain: "laboral/#",
    endpoints
  },
  development: {
    baseUrl: "http://localhost:3000",
    subDomain: "",
    endpoints
  },
  test: {
    baseUrl: "baseUrl",
    subDomain: "subDomain",
    endpoints
  }
}[Environment.NODE_ENV];
