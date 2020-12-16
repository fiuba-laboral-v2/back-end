import { UniqueConstraintError } from "sequelize";
import { SecretarySettings } from "$models";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { Secretary } from "$src/models/Admin";
import { SecretarySettingsNotFoundError } from "$src/models/SecretarySettings/Errors";

describe("SecretarySettingsRepository", () => {
  beforeAll(() => SecretarySettingsRepository.truncate());

  it("saves the secretarySettings in the database", async () => {
    const secretary = Secretary.graduados;
    const secretarySettings = new SecretarySettings({
      secretary,
      offerDurationInDays: 15,
      email: "graduados@fi.uba.ar"
    });
    await SecretarySettingsRepository.save(secretarySettings);
    const savedSecretarySettings = await SecretarySettingsRepository.findBySecretary(secretary);

    expect(savedSecretarySettings).toBeObjectContaining({
      secretary: secretarySettings.secretary,
      offerDurationInDays: secretarySettings.offerDurationInDays
    });
  });

  it("throws an error if the secretarySettings has an existing secretary value", async () => {
    const secretary = Secretary.extension;
    const attributes = {
      secretary,
      offerDurationInDays: 15,
      email: "graduados@fi.uba.ar"
    };
    const secretarySettings = new SecretarySettings(attributes);
    const existentSecretarySettings = new SecretarySettings(attributes);

    await SecretarySettingsRepository.save(secretarySettings);
    await expect(
      SecretarySettingsRepository.save(existentSecretarySettings)
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
  });

  it("throws an error if the secretary doesn't exists", async () => {
    const secretary = "cachito" as Secretary;
    await expect(SecretarySettingsRepository.findBySecretary(secretary)).rejects.toThrow(
      `invalid input value for enum secretary: "cachito"`
    );
  });

  it("throws an error if the secretary table wasn't populated", async () => {
    await SecretarySettingsRepository.truncate();
    const secretary = Secretary.graduados;
    await expect(
      SecretarySettingsRepository.findBySecretary(secretary)
    ).rejects.toThrowErrorWithMessage(
      SecretarySettingsNotFoundError,
      "The SecretarySettings for the secretary of graduados don't exist. Please check if the table was populated using the seeders"
    );
  });

  it("deletes all settings if the table is truncated", async () => {
    await SecretarySettingsRepository.truncate();
    await SecretarySettingsRepository.save(
      new SecretarySettings({
        secretary: Secretary.graduados,
        offerDurationInDays: 15,
        email: "graduados@fi.uba.ar"
      })
    );
    expect(await SecretarySettings.findAll()).toHaveLength(1);
    await SecretarySettingsRepository.truncate();
    expect(await SecretarySettings.findAll()).toHaveLength(0);
  });
});
