import { nonNull } from "$graphql/fieldTypes";
import { IApolloServerContext } from "$graphql/Context";
import { GraphQLSecretarySettings } from "../Types/GraphQLSecretarySettings";
import { GraphQLInt } from "graphql/type/scalars";
import { AdminRepository } from "$src/models/Admin";
import { SecretarySettingsRepository } from "../../../models/SecretarySettings/Repository";

export const updateMySecretarySettings = {
  type: GraphQLSecretarySettings,
  args: {
    offerDurationInDays: {
      type: nonNull(GraphQLInt)
    }
  },
  resolve: async (
    _: undefined,
    { offerDurationInDays }: IMutationVariables,
    { currentUser }: IApolloServerContext
  ) => {
    const adminUserUuid = currentUser.getAdmin().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);

    const secretarySettings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    secretarySettings.set({ offerDurationInDays });
    return SecretarySettingsRepository.save(secretarySettings);
  }
};

interface IMutationVariables {
  offerDurationInDays: number;
}
