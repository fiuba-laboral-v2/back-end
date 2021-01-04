import { isAdmin, isCompanyUser, isFromApprovedCompany } from "$graphql/Rules";
import { or } from "graphql-shield";
export const companyUserPermissions = {
  Query: {
    getCompanyUsers: isFromApprovedCompany
  },
  Mutation: {
    saveCompanyUser: isFromApprovedCompany,
    updatePassword: isFromApprovedCompany
  },
  CompanyUser: or(isCompanyUser, isAdmin)
};
