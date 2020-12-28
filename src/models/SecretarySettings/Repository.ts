import { Transaction } from "sequelize";
import { AdminRepository, Secretary } from "../Admin";
import { SecretarySettingsNotFoundError } from "./Errors";
import { SecretarySettings } from "./Model";

export const SecretarySettingsRepository = {
  save: (secretarySettings: SecretarySettings, transaction?: Transaction) =>
    secretarySettings.save({ transaction }),
  findBySecretary: async (secretary: Secretary) => {
    const secretarySettings = await SecretarySettings.findByPk(secretary);
    if (!secretarySettings) throw new SecretarySettingsNotFoundError(secretary);
    return secretarySettings;
  },
  findByAdminUuid: async (uuid: string) => {
    const admin = await AdminRepository.findByUserUuid(uuid);
    return SecretarySettingsRepository.findBySecretary(admin.secretary);
  },
  truncate: () => SecretarySettings.truncate()
};
