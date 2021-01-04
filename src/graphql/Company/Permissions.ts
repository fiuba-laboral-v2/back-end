import { isAdmin, isCompanyUser } from "$graphql/Rules";
import { isApprovedApplicant } from "$graphql/Rules/isApprovedApplicant";
import { or } from "graphql-shield";

export const companyPermissions = {
  Query: {
    getCompanies: or(isApprovedApplicant, isAdmin),
    getCompanyByUuid: or(isApprovedApplicant, isAdmin)
  },
  Mutation: {
    updateCurrentCompany: isCompanyUser,
    updateCompanyApprovalStatus: isAdmin
  },
  Company: {
    approvalStatus: or(isCompanyUser, isAdmin),
    users: or(isCompanyUser, isAdmin)
  }
};
