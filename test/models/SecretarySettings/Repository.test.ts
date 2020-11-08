import { UniqueConstraintError } from "sequelize";
import { SecretarySettings } from "$models";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { Secretary } from "$src/models/Admin";

describe("SecretarySettingsRepository", () => {
  beforeAll(() => SecretarySettingsRepository.truncate());

  it("saves the secretarySettings in the database", async () => {
    const secretary = Secretary.graduados;
    const secretarySettings = new SecretarySettings({
      secretary,
      offerDurationInDays: 15
    });
    await SecretarySettingsRepository.save(secretarySettings);
    const savedSecretarySettings = (await SecretarySettingsRepository.findBySecretary(secretary))!;

    expect({
      secretary: savedSecretarySettings.secretary,
      offerDurationInDays: savedSecretarySettings.offerDurationInDays
    }).toEqual({
      secretary: secretarySettings.secretary,
      offerDurationInDays: secretarySettings.offerDurationInDays
    });
  });

  it("throws an error if the secretarySettings has an secretary value", async () => {
    const secretary = Secretary.extension;
    const attributes = {
      secretary,
      offerDurationInDays: 15
    };
    const secretarySettings = new SecretarySettings(attributes);
    const existentSecretarySettings = new SecretarySettings(attributes);

    await SecretarySettingsRepository.save(secretarySettings);
    await expect(
      SecretarySettingsRepository.save(existentSecretarySettings)
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
  });

  it("deletes all notifications if JobApplications table is truncated", async () => {
    await SecretarySettingsRepository.truncate();
    await SecretarySettingsRepository.save(
      new SecretarySettings({
        secretary: Secretary.graduados,
        offerDurationInDays: 15
      })
    );
    expect(await SecretarySettings.findAll()).toHaveLength(1);
    await SecretarySettingsRepository.truncate();
    expect(await SecretarySettings.findAll()).toHaveLength(0);
  });
});
