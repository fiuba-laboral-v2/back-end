import { ValidationError } from "sequelize";
import { InvalidEmailError, InvalidFiubaEmailError } from "validations-fiuba-laboral-v2";

import { SecretarySettings } from "$models";
import { Secretary } from "$models/Admin";

describe("SecretarySettings", () => {
  it("creates a valid secretarySettings for the secretary of extension", async () => {
    const secretarySettingsAttributes = {
      secretary: Secretary.extension,
      offerDurationInDays: 15,
      email: "extension@fi.uba.ar",
      emailSignature: "FIUBA desea feliz navidad",
      automaticJobApplicationApproval: true
    };
    const secretarySettings = new SecretarySettings(secretarySettingsAttributes);
    await expect(secretarySettings.validate()).resolves.not.toThrow();
    expect(secretarySettings).toBeObjectContaining(secretarySettingsAttributes);
  });

  it("creates a valid secretarySettings for the secretary of graduados", async () => {
    const secretarySettingsAttributes = {
      secretary: Secretary.graduados,
      offerDurationInDays: 1,
      email: "graduados@fi.uba.ar",
      emailSignature: "FIUBA desea feliz año nuevo",
      automaticJobApplicationApproval: true
    };
    const secretarySettings = new SecretarySettings(secretarySettingsAttributes);
    await expect(secretarySettings.validate()).resolves.not.toThrow();
    expect(secretarySettings).toBeObjectContaining(secretarySettingsAttributes);
  });

  it("throws an error if no emailSignature is provided", async () => {
    const secretarySettings = new SecretarySettings({
      secretary: Secretary.graduados,
      offerDurationInDays: 8,
      email: "graduados@fi.uba.ar",
      automaticJobApplicationApproval: true
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: SecretarySettings.emailSignature cannot be null"
    );
  });

  it("throws an error if no secretary is provided", async () => {
    const secretarySettings = new SecretarySettings({
      offerDurationInDays: 15,
      email: "graduados@fi.uba.ar",
      automaticJobApplicationApproval: true
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: SecretarySettings.secretary cannot be null"
    );
  });

  it("throws an error if no offerDurationInDays is provided", async () => {
    const secretarySettings = new SecretarySettings({
      secretary: Secretary.extension,
      email: "extension@fi.uba.ar",
      automaticJobApplicationApproval: true
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: SecretarySettings.offerDurationInDays cannot be null"
    );
  });

  it("throws an error if no email is provided", async () => {
    const secretarySettings = new SecretarySettings({
      offerDurationInDays: 15,
      secretary: Secretary.extension,
      automaticJobApplicationApproval: true
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: SecretarySettings.email cannot be null"
    );
  });

  it("throws an error if no automaticJobApplicationApproval is provided", async () => {
    const secretarySettings = new SecretarySettings({
      secretary: Secretary.extension,
      offerDurationInDays: 15,
      email: "extension@fi.uba.ar",
      emailSignature: "FIUBA desea feliz navidad"
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: SecretarySettings.automaticJobApplicationApproval cannot be null"
    );
  });

  it("throws an error if offerDurationInDays is less than 1", async () => {
    const secretarySettings = new SecretarySettings({
      secretary: Secretary.extension,
      offerDurationInDays: 0,
      email: "extension@fi.uba.ar"
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: El número debe ser mayor a 0"
    );
  });

  it("throws an error if offerDurationInDays is float", async () => {
    const secretarySettings = new SecretarySettings({
      secretary: Secretary.extension,
      offerDurationInDays: 13.4,
      email: "extension@fi.uba.ar"
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: El número debe ser entero"
    );
  });

  it("throws an error if offerDurationInDays is null", async () => {
    const secretarySettings = new SecretarySettings({
      secretary: Secretary.extension,
      offerDurationInDays: null,
      email: "extension@fi.uba.ar"
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Violation: SecretarySettings.offerDurationInDays cannot be null"
    );
  });

  it("throws an error if the secretary is not extension or graduados", async () => {
    const secretarySettings = new SecretarySettings({
      offerDurationInDays: 15,
      secretary: "something",
      email: "extension@fi.uba.ar"
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "Validation error: Secretary must be one of these values: extension,graduados"
    );
  });

  it("throws an error if the email has invalid format", async () => {
    const email = "extension";
    const secretarySettings = new SecretarySettings({
      offerDurationInDays: 15,
      secretary: "something",
      email
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      InvalidEmailError.buildMessage(email)
    );
  });

  it("throws an error if the email does not have a fiuba domain", async () => {
    const email = "extension@gmail.com";
    const secretarySettings = new SecretarySettings({
      offerDurationInDays: 15,
      secretary: "something",
      email
    });
    await expect(secretarySettings.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      InvalidFiubaEmailError.buildMessage()
    );
  });
});
