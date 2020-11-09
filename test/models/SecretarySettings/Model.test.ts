import { ValidationError } from "sequelize";

import { SecretarySettings } from "$models";
import { Secretary } from "$models/Admin";

describe("SecretarySettings", () => {
  it("creates a valid secretarySettings for the secretary of extension", async () => {
    const secretarySettingsAttributes = {
      secretary: Secretary.extension,
      offerDurationInDays: 15
    };
    const secretarySettings = new SecretarySettings(secretarySettingsAttributes);
    await expect(secretarySettings.validate()).resolves.not.toThrow();
    expect(secretarySettings).toBeObjectContaining(secretarySettingsAttributes);
  });

  it("creates a valid secretarySettings for the secretary of graduados", async () => {
    const secretarySettingsAttributes = {
      secretary: Secretary.graduados,
      offerDurationInDays: 1
    };
    const secretarySettings = new SecretarySettings(secretarySettingsAttributes);
    await expect(secretarySettings.validate()).resolves.not.toThrow();
    expect(secretarySettings).toBeObjectContaining(secretarySettingsAttributes);
  });

  it("throws an error if no secretary is provided", async () => {
    const secretarySettings = new SecretarySettings({ offerDurationInDays: 15 });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: SecretarySettings.secretary cannot be null"
    );
  });

  it("throws an error if no offerDurationInDays is provided", async () => {
    const secretarySettings = new SecretarySettings({ secretary: Secretary.extension });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: SecretarySettings.offerDurationInDays cannot be null"
    );
  });

  it("throws an error if offerDurationInDays is less than 1", async () => {
    const secretarySettings = new SecretarySettings({
      secretary: Secretary.extension,
      offerDurationInDays: 0
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: Validation min on offerDurationInDays failed"
    );
  });

  it("throws an error if offerDurationInDays is float", async () => {
    const secretarySettings = new SecretarySettings({
      secretary: Secretary.extension,
      offerDurationInDays: 13.4
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: Validation isInt on offerDurationInDays failed"
    );
  });

  it("throws an error if offerDurationInDays is null", async () => {
    const secretarySettings = new SecretarySettings({
      secretary: Secretary.extension,
      offerDurationInDays: null
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Violation: SecretarySettings.offerDurationInDays cannot be null"
    );
  });

  it("throws an error if the secretary is not extension or graduados", async () => {
    const secretarySettings = new SecretarySettings({
      offerDurationInDays: 15,
      secretary: "something"
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: Secretary must be one of these values: extension,graduados"
    );
  });
});
