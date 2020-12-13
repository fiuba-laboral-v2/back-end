import { FrontendConfig } from "$config";

export const FrontEndLinksBuilder = {
  company: {
    offerLink: (uuid: string) => {
      const { baseUrl, subDomain, endpoints } = FrontendConfig;

      return `${baseUrl}/${subDomain}/${endpoints.company.offer(uuid)}`;
    },
    applicantLink: (uuid: string) => {
      const { baseUrl, subDomain, endpoints } = FrontendConfig;
      return `${baseUrl}/${subDomain}/${endpoints.company.applicant(uuid)}`;
    }
  },
  applicant: {
    profileLink: () => {
      const { baseUrl, subDomain, endpoints } = FrontendConfig;
      return `${baseUrl}/${subDomain}/${endpoints.applicant.profile()}`;
    },
    offerLink: (uuid: string) => {
      const { baseUrl, subDomain, endpoints } = FrontendConfig;
      return `${baseUrl}/${subDomain}/${endpoints.applicant.offer(uuid)}`;
    }
  }
};
