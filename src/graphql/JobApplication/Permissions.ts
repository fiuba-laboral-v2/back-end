import { isFromApprovedCompany } from "../Rules";
import { isApprovedApplicant } from "../Rules/isApprovedApplicant";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: isApprovedApplicant
  },
  Query: {
    getMyLatestJobApplications: isFromApprovedCompany
  }
};
