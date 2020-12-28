import { FrontendConfig } from "$config";

const buildBaseUrl = () => {
  const { baseUrl, subDomain } = FrontendConfig;
  return `${baseUrl}/${subDomain}`;
};

export const FrontEndLinksBuilder = {
  company: {
    offerLink: (uuid: string) =>
      `${buildBaseUrl()}/${FrontendConfig.endpoints.company.offer(uuid)}`,
    applicantLink: (uuid: string) =>
      `${buildBaseUrl()}/${FrontendConfig.endpoints.company.applicant(uuid)}`,
    profileLink: () => `${buildBaseUrl()}/${FrontendConfig.endpoints.company.profile()}`,
    editMyForgottenPassword: (token: string) =>
      `${buildBaseUrl()}/${FrontendConfig.endpoints.company.editMyForgottenPassword(token)}`
  },
  applicant: {
    profileLink: () => `${buildBaseUrl()}/${FrontendConfig.endpoints.applicant.profile()}`,
    offerLink: (uuid: string) =>
      `${buildBaseUrl()}/${FrontendConfig.endpoints.applicant.offer(uuid)}`
  },
  admin: {
    company: {
      profileLink: (uuid: string) =>
        `${buildBaseUrl()}/${FrontendConfig.endpoints.admin.company.profile(uuid)}`
    }
  }
};
