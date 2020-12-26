import { Transaction } from "sequelize";
import { SharedSettingsNotFoundError } from "./Errors";
import { SharedSettings } from "./Model";

export const SharedSettingsRepository = {
  save: (secretarySettings: SharedSettings, transaction?: Transaction) =>
    secretarySettings.save({ transaction }),
  fetch: async () => {
    const secretarySettings = await SharedSettings.findOne();
    if (!secretarySettings) throw new SharedSettingsNotFoundError();
    return secretarySettings;
  },
  truncate: () => SharedSettings.truncate()
};
