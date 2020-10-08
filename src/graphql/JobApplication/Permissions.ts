import { isFromApprovedCompany, isApprovedApplicant, isAdmin } from "$graphql/Rules";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: isApprovedApplicant,
    updateJobApplicationApprovalStatus: isAdmin
  },
  Query: {
    getMyLatestJobApplications: isFromApprovedCompany,
    getJobApplicationByUuid: isAdmin,
    getJobApplications: isAdmin
  }
};
