import { ICapability, Capability } from "./index";
import { Op } from "sequelize";
import { ApplicantCapability } from "../ApplicantCapability";
import Database from "../../config/Database";

export const CapabilityRepository = {
  create: async ({ description }: ICapability) => {
    const capability: Capability = new Capability({ description });
    return capability.save();
  },
  findByDescription: async (description: string[])  =>
    Capability.findAll({ where: { description: { [Op.or]: description }} }),
  findOrCreate: async (description: string) =>
    Capability.findOrCreate({ where: { description } }),
  findAll: async () =>
    Capability.findAll(),
  deleteByCode: async (code: string) => {
    const transaction = await Database.transaction();
    try {
      await ApplicantCapability.destroy({ where: { capabilityUuid: code }, transaction});
      const carrerDestroyed = await Capability.destroy({ where: { code }, transaction });
      await transaction.commit();
      return carrerDestroyed;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  truncate: async () =>
    Capability.destroy({ truncate: true })
};
