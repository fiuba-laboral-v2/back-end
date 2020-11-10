import { GraphQLSecretarySettings } from "../Types/GraphQLSecretarySettings";
import { GraphQLSecretary } from "$src/graphql/Admin/Types/GraphQLSecretary";

import { Secretary } from "$src/models/Admin";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";

const getSecretaryOfferDuration = {
  type: GraphQLSecretarySettings,
  args: {
    secretary: {
      type: GraphQLSecretary
    }
  },
  resolve: (_: undefined, secretary: Secretary) =>
    SecretarySettingsRepository.findBySecretary(secretary)
};

export { getSecretaryOfferDuration };
