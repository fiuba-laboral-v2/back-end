import { isApplicant, isCompanyApproved } from "../Rules";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: isApplicant
  },
  Query: {
    getMyLatestJobApplications: isCompanyApproved
  }
};
