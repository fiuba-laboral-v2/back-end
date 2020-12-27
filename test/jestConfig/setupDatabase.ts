import { Database } from "$config";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { SharedSettingsGenerator } from "$generators/SharedSettings";
import { SharedSettingsRepository } from "$models/SharedSettings";

export const setupDatabase = () => {
  beforeAll(async () => {
    Database.setConnection();
    await SecretarySettingsRepository.truncate();
    await SharedSettingsRepository.truncate();
    await SecretarySettingsGenerator.createDefaultSettings();
    await SharedSettingsGenerator.createDefaultSettings();
  });
  afterAll(() => Database.close());
};
