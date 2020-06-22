import { isUser, isCompanyUser, isAdmin } from "../Rules";

export const companyPermissions = {
  Query: {
    getCompanies: isUser,
    getCompanyByUuid: isUser
  },
  Mutation: {
    updateCurrentCompany: isCompanyUser,
    updateCompanyApprovalStatus: isAdmin
  }
};
