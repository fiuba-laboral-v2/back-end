import { isUser, isCompanyUser } from "../rules";

export const companyPermissions = {
  Query: {
    getCompanies: isUser,
    getCompanyByUuid: isUser
  },
  Mutation: {
    updateCurrentCompany: isCompanyUser
  }
};
