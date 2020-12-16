import { Environment } from "$config/Environment";

const endpoints = {
  company: {
    offer: (uuid: string) => `empresa/ofertas/${uuid}`,
    applicant: (uuid: string) => `empresa/postulantes/${uuid}`,
    profile: () => "empresa/perfil"
  },
  applicant: {
    profile: () => "postulante/perfil",
    offer: (uuid: string) => `postulante/ofertas/${uuid}`
  },
  admin: {
    company: {
      profile: (uuid: string) => `admin/empresas/${uuid}`
    }
  }
};

export const FrontendConfig: IFrontendConfig = {
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
    subDomain: "#",
    endpoints
  },
  test: {
    baseUrl: "baseUrl",
    subDomain: "subDomain",
    endpoints
  }
}[Environment.NODE_ENV()];

interface IFrontendConfig {
  baseUrl: string;
  subDomain: string;
  endpoints: {
    company: {
      offer: (uuid: string) => string;
      applicant: (uuid: string) => string;
      profile: () => string;
    };
    applicant: {
      profile: () => string;
      offer: (uuid: string) => string;
    };
    admin: {
      company: {
        profile: (uuid: string) => string;
      };
    };
  };
}
