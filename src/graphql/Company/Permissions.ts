import { isUser } from "../rules";

export const companyPermissions = {
  Query: {
    getCompanies: isUser,
    getCompanyByUuid: isUser
  }
};
