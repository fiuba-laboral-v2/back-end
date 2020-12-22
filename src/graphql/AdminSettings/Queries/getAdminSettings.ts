import { GraphQLAdminSettings } from "../Types/GraphQLAdminSettings";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";
import { IApolloServerContext } from "$src/graphql/Context";

import { AdminRepository } from "$src/models/Admin";

export const getAdminSettings = {
  type: GraphQLAdminSettings,
  resolve: async (_: undefined, __: undefined, { currentUser }: IApolloServerContext) => {
    const adminUserUuid = currentUser.getAdminRole().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);
    return SecretarySettingsRepository.findBySecretary(admin.secretary);
  }
};
