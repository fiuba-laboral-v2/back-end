import { isFromApprovedCompany, isAdmin } from "$graphql/Rules";

export const adminSettingsPermissions = {
  Mutation: {
    updateAdminSettings: isAdmin
  },
  Query: {
    getAdminSettings: isAdmin,
    getSecretaryOfferDuration: isFromApprovedCompany
  }
};
