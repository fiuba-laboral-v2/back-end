import Database from "../../config/Database";
import { ISaveAdmin } from "./Interface";
import { Admin } from "./Model";
import { UserRepository } from "../User";
import { AdminNotFoundError } from "./Errors";

export const AdminRepository = {
  create: async ({ user: userAttributes }: ISaveAdmin) => {
    const transaction = await Database.transaction();
    try {
      const { uuid: userUuid } = await UserRepository.create(userAttributes, transaction);
      const admin = await Admin.create({ userUuid }, { transaction });
      await transaction.commit();
      return admin;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  findByUserUuid: async (userUuid: string) => {
    const admin = await Admin.findByPk(userUuid);
    if (!admin) throw new AdminNotFoundError(userUuid);

    return admin;
  },
  findAll: () => Admin.findAll(),
  truncate: () => Admin.truncate({ cascade: true })
};
