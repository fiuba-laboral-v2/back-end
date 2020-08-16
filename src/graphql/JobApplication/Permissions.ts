import { isFromApprovedCompany } from "$graphql/Rules";
import { isApprovedApplicant } from "$graphql/Rules/isApprovedApplicant";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: isApprovedApplicant,
  },
  Query: {
    getMyLatestJobApplications: isFromApprovedCompany,
  },
};
