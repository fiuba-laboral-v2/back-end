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
      `${buildBaseUrl()}/${FrontendConfig.endpoints.company.applicant(uuid)}`
  },
  applicant: {
    profileLink: () => `${buildBaseUrl()}/${FrontendConfig.endpoints.applicant.profile()}`,
    offerLink: (uuid: string) =>
      `${buildBaseUrl()}/${FrontendConfig.endpoints.applicant.offer(uuid)}`
  }
};
