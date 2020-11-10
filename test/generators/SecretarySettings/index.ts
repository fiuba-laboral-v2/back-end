import { SecretarySettings } from "$src/models";
import { Secretary } from "$src/models/Admin";

export const SecretarySettingsGenerator = {
  createDefaultSettings: () => {
    SecretarySettings.bulkCreate([
      { secretary: Secretary.graduados, offerDurationInDays: 15 },
      { secretary: Secretary.extension, offerDurationInDays: 15 }
    ]);
  }
};
