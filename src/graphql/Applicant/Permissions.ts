import { isAdmin, isApplicant, isUser } from "../Rules";
import { or } from "graphql-shield";
import { isApprovedApplicant } from "../Rules/isApprovedApplicant";

export const applicantPermissions = {
  Query: {
    getApplicant: isUser,
    getApplicants: or(isApprovedApplicant, isAdmin)
  },
  Mutation: {
    updateCurrentApplicant: isApplicant,
    updateApplicantApprovalStatus: isAdmin
  }
};
