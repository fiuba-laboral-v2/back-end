import { GraphQLAdminSettings } from "../Types/GraphQLAdminSettings";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";
import { IApolloServerContext } from "$src/graphql/Context";
import { AdminRepository } from "$src/models/Admin";
import { AdminSettings } from "$models/AdminSettings";

export const getAdminSettings = {
  type: GraphQLAdminSettings,
  resolve: async (_: undefined, __: undefined, { currentUser }: IApolloServerContext) => {
    const adminUserUuid = currentUser.getAdminRole().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);
    return new AdminSettings(await SecretarySettingsRepository.findBySecretary(admin.secretary));
  }
};
