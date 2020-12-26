import { GraphQLAdminSettingsTranslations } from "../Types/GraphQLAdminSettingsTranslations";
import { SharedSettingsRepository } from "$models/SharedSettings";

export const getAdminSettingsTranslations = {
  type: GraphQLAdminSettingsTranslations,
  resolve: () => SharedSettingsRepository.find()
};
