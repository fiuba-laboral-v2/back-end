import { SecretarySettings } from "$src/models";
import { Secretary } from "$src/models/Admin";

export const SecretarySettingsGenerator = {
  createDefaultSettings: () =>
    SecretarySettings.bulkCreate([
      {
        secretary: Secretary.graduados,
        offerDurationInDays: 15,
        email: "graduados@fi.uba.ar",
        emailSignature: "Graduados email signature",
        automaticJobApplicationApproval: true
      },
      {
        secretary: Secretary.extension,
        offerDurationInDays: 15,
        email: "extension@fi.uba.ar",
        emailSignature: "Extensión email signature",
        automaticJobApplicationApproval: false
      }
    ])
};
