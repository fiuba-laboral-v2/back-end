import { UserRepository } from "$models/User";

export const Sender = {
  findByAdmin: async (adminUserUuid: string) => {
    const sender = await UserRepository.findByUuid(adminUserUuid);
    return {
      email: sender.email,
      name: `${sender.name} ${sender.surname}`
    };
  },
  noReply: () => ({
    email: "bolsa.de.trabajo.notify@fi.uba.ar",
    name: "No contestar a este correo"
  })
};
