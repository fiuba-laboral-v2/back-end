import { GraphQLSharedSettings } from "../Types/GraphQLSharedSettings";
import { SharedSettingsRepository } from "$models/SharedSettings";

export const getSharedSettings = {
  type: GraphQLSharedSettings,
  resolve: () => SharedSettingsRepository.fetch()
};
