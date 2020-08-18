import { Database } from "$config";
import { ISaveAdmin } from "./Interface";
import { UserRepository } from "$models/User";
import { AdminNotFoundError } from "./Errors";
import { Admin } from "..";

export const AdminRepository = {
  create: ({ user: userAttributes, secretary }: ISaveAdmin) =>
    Database.transaction(async transaction => {
      const { uuid: userUuid } = await UserRepository.create(userAttributes, transaction);
      return Admin.create({ userUuid, secretary }, { transaction });
    }),
  findByUserUuid: async (userUuid: string) => {
    const admin = await Admin.findByPk(userUuid);
    if (!admin) throw new AdminNotFoundError(userUuid);

    return admin;
  },
  findAll: () => Admin.findAll(),
  truncate: () => Admin.truncate({ cascade: true })
};
