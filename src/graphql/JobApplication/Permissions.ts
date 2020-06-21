import { isApplicant, isFromApprovedCompany } from "../Rules";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: isApplicant
  },
  Query: {
    getMyLatestJobApplications: isFromApprovedCompany
  }
};
