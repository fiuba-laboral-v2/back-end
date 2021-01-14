import { isAdmin } from "$graphql/Rules";

export const adminPermissions = {
  Query: {
    getAdmins: isAdmin,
    getCompanyUsersByCompany: isAdmin,
    getAdminByUuid: isAdmin
  },
  Mutation: {
    saveAdmin: isAdmin,
    updateAdmin: isAdmin,
    deactivateAdminAccount: isAdmin
  }
};
