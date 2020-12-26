import { Database } from "$config";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";

export const setupDatabase = () => {
  beforeAll(async () => {
    Database.setConnection();
    await SecretarySettingsRepository.truncate();
    await SecretarySettingsGenerator.createDefaultSettings();
  });
  afterAll(() => {
    Database.close();
  });
};
