import { GraphQLSecretarySettings } from "../Types/GraphQLSecretarySettings";
import { GraphQLSecretary } from "$src/graphql/Admin/Types/GraphQLSecretary";
import { nonNull } from "$graphql/fieldTypes";

import { Secretary } from "$src/models/Admin";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";

const getSecretaryOfferDuration = {
  type: GraphQLSecretarySettings,
  args: {
    secretary: {
      type: nonNull(GraphQLSecretary)
    }
  },
  resolve: (_: undefined, { secretary }: { secretary: Secretary }) =>
    SecretarySettingsRepository.findBySecretary(secretary)
};

export { getSecretaryOfferDuration };
