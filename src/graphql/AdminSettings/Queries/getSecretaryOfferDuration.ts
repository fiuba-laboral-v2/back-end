import { GraphQLSecretary } from "$src/graphql/Admin/Types/GraphQLSecretary";
import { nonNull, Int } from "$graphql/fieldTypes";
import { Secretary } from "$src/models/Admin";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";

export const getSecretaryOfferDuration = {
  type: Int,
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
