import { isFromApprovedCompany, isAdmin } from "$graphql/Rules";

export const secretarySettingsPermissions = {
  Mutation: {
    updateMySecretarySettings: isAdmin
  },
  Query: {
    getMySecretarySettings: isAdmin
  }
};
