import { isAdmin, isApplicant, isUser } from "$graphql/Rules";

export const applicantPermissions = {
  Query: {
    getApplicant: isUser,
    getApplicants: isAdmin,
    getApplicantEmails: isAdmin
  },
  Mutation: {
    updateCurrentApplicant: isApplicant,
    updateApplicantApprovalStatus: isAdmin,
    updatePadron: isApplicant
  }
};
