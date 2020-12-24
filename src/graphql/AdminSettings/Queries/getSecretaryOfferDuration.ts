import { GraphQLSecretary } from "$src/graphql/Admin/Types/GraphQLSecretary";
import { nonNull } from "$graphql/fieldTypes";
import { Secretary } from "$src/models/Admin";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";
import { GraphQLInt } from "graphql/type/scalars";

const getSecretaryOfferDuration = {
  type: GraphQLInt,
  args: {
    secretary: {
      type: nonNull(GraphQLSecretary)
    }
  },
  resolve: async (_: undefined, { secretary }: { secretary: Secretary }) => {
    const settings = await SecretarySettingsRepository.findBySecretary(secretary);
    return settings.offerDurationInDays;
  }
};

export { getSecretaryOfferDuration };
