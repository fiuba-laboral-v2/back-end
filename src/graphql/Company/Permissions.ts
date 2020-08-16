import { isAdmin, isCompanyUser } from "$graphql/Rules";
import { isApprovedApplicant } from "$graphql/Rules/isApprovedApplicant";
import { or } from "graphql-shield";

export const companyPermissions = {
  Query: {
    getCompanies: isApprovedApplicant,
    getCompanyByUuid: or(isApprovedApplicant, isAdmin)
  },
  Mutation: {
    updateCurrentCompany: isCompanyUser,
    updateCompanyApprovalStatus: isAdmin
  }
};
