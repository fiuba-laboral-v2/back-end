import { isAdmin, isCompanyUser, isFromApprovedCompany } from "$graphql/Rules";
import { or } from "graphql-shield";
export const companyUserPermissions = {
  Query: {
    getCompanyUsers: isCompanyUser,
    getMyCompanyUser: isCompanyUser
  },
  Mutation: {
    saveCompanyUser: isFromApprovedCompany,
    updatePassword: isFromApprovedCompany,
    updateCompanyUser: isCompanyUser
  },
  CompanyUser: or(isCompanyUser, isAdmin)
};
