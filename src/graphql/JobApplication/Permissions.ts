import { isApplicant, isCompanyUser } from "../Rules";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: isApplicant
  },
  Query: {
    getMyLatestJobApplications: isCompanyUser
  }
};
