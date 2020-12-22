import { GraphQLAdminSettings } from "../Types/GraphQLAdminSettings";
import { GraphQLSecretary } from "$src/graphql/Admin/Types/GraphQLSecretary";
import { nonNull } from "$graphql/fieldTypes";

import { Secretary } from "$src/models/Admin";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";

const getSecretaryOfferDuration = {
  type: GraphQLAdminSettings,
  args: {
    secretary: {
      type: nonNull(GraphQLSecretary)
    }
  },
  resolve: (_: undefined, { secretary }: { secretary: Secretary }) =>
    SecretarySettingsRepository.findBySecretary(secretary)
};

export { getSecretaryOfferDuration };
