import { GraphQLSecretarySettings } from "../Types/GraphQLSecretarySettings";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";
import { IApolloServerContext } from "$src/graphql/Context";

import { AdminRepository } from "$src/models/Admin";

const getMySecretarySettings = {
  type: GraphQLSecretarySettings,
  resolve: async (_: undefined, { currentUser }: IApolloServerContext) => {
    const adminUserUuid = currentUser.getAdmin().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);
    return SecretarySettingsRepository.findBySecretary(admin.secretary);
  }
};

export { getMySecretarySettings };
