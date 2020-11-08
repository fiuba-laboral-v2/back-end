import { Transaction } from "sequelize";
import { Secretary } from "../Admin";
import { SecretarySettings } from "./Model";

export const SecretarySettingsRepository = {
  save: (secretarySettings: SecretarySettings, transaction?: Transaction) =>
    secretarySettings.save({ transaction }),
  findBySecretary: (secretary: Secretary) => SecretarySettings.findByPk(secretary),
  truncate: () => SecretarySettings.truncate()
};
