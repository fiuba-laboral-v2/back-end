import { UserRepository } from "$models/User";
import { AdminRepository } from "$models/Admin";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

export const Sender = {
  findByAdmin: async (adminUserUuid: string) => {
    const sender = await UserRepository.findByUuid(adminUserUuid);
    const admin = await AdminRepository.findByUserUuid(adminUserUuid);
    const settings = await SecretarySettingsRepository.findBySecretary(admin.secretary);
    return {
      email: settings.email,
      name: `${sender.name} ${sender.surname}`
    };
  },
  noReply: () => ({
    email: "no-reply@fi.uba.ar",
    name: "[No responder] Bolsa de Trabajo FIUBA"
  })
};
