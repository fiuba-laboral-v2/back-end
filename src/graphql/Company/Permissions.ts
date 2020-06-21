import { isUser, isCompanyUser } from "../Rules";

export const companyPermissions = {
  Query: {
    getCompanies: isUser,
    getCompanyByUuid: isUser
  },
  Mutation: {
    updateCurrentCompany: isCompanyUser
  }
};
