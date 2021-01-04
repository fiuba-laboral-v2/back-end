import { isAdmin, isCompanyUser } from "$graphql/Rules";
import { or } from "graphql-shield";
export const companyUserPermissions = {
  Query: {
    getCompanyUsers: isCompanyUser,
    getMyCompanyUser: isCompanyUser
  },
  Mutation: {
    saveCompanyUser: isCompanyUser,
    updatePassword: isCompanyUser,
    updateCompanyUser: isCompanyUser
  },
  CompanyUser: or(isCompanyUser, isAdmin)
};
