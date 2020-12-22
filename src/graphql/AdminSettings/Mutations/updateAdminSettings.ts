import { nonNull } from "$graphql/fieldTypes";
import { IApolloServerContext } from "$graphql/Context";
import { GraphQLAdminSettings } from "../Types/GraphQLAdminSettings";
import { GraphQLInt, GraphQLString } from "graphql/type/scalars";
import { AdminRepository } from "$models/Admin";
import { SecretarySettingsRepository } from "$models/SecretarySettings/Repository";
import { AdminSettings } from "$models/AdminSettings";

export const updateAdminSettings = {
  type: GraphQLAdminSettings,
  args: {
    offerDurationInDays: {
      type: nonNull(GraphQLInt)
    },
    email: {
      type: nonNull(GraphQLString)
    }
  },
  resolve: async (
    _: undefined,
    variables: IMutationVariables,
    { currentUser }: IApolloServerContext
  ) => {
    const adminUserUuid = currentUser.getAdminRole().adminUserUuid;
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);

    const secretarySettings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    secretarySettings.set(variables);
    return new AdminSettings(await SecretarySettingsRepository.save(secretarySettings));
  }
};

interface IMutationVariables {
  offerDurationInDays: number;
}
