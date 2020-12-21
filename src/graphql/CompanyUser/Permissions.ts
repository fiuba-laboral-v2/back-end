import { isFromApprovedCompany } from "$graphql/Rules";

export const companyUserPermissions = {
  Mutation: {
    saveCompanyUser: isFromApprovedCompany
  }
};
