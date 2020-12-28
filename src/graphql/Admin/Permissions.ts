import { isAdmin } from "$graphql/Rules";

export const adminPermissions = {
  Query: {
    getAdmins: isAdmin,
    getCompanyUsersByCompany: isAdmin
  },
  Mutation: {
    saveAdmin: isAdmin
  }
};
