import { isFromApprovedCompany, isApprovedApplicant, isAdmin, isUser } from "$graphql/Rules";

export const jobApplicationPermissions = {
  Mutation: {
    saveJobApplication: isApprovedApplicant,
    updateJobApplicationApprovalStatus: isAdmin
  },
  Query: {
    getMyLatestJobApplications: isFromApprovedCompany,
    getJobApplicationByUuid: isUser
  }
};
