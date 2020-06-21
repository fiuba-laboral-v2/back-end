import { isApplicant, isApprovedCompany } from "../Rules";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: isApplicant
  },
  Query: {
    getMyLatestJobApplications: isApprovedCompany
  }
};
