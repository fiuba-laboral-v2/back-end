import { isAdmin, isCompanyUser } from "../Rules";
import { isApprovedApplicant } from "../Rules/isApprovedApplicant";
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
