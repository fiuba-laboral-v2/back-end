import { isFromApprovedCompany } from "$graphql/Rules";

export const companyUserPermissions = {
  Query: {
    getCompanyUsers: isFromApprovedCompany
  },
  Mutation: {
    saveCompanyUser: isFromApprovedCompany,
    updatePassword: isFromApprovedCompany
  }
};
