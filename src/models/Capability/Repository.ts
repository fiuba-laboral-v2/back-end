import { ICapability, Capability } from "./index";
import { Op } from "sequelize";
import { ApplicantCapability } from "../ApplicantCapability";
import Database from "../../config/Database";

export const CapabilityRepository = {
  create: async ({ description }: ICapability) => {
    const capability = new Capability({ description });
    return capability.save();
  },
  findByDescription: async (description: string[])  =>
    Capability.findAll({ where: { description: { [Op.or]: description }} }),
  findOrCreate: async (description: string) =>
    Capability.findOrCreate({ where: { description } }),
  findOrCreateByDescriptions: async (descriptions: string[] = []) => {
    const capabilities: Capability[] = [];
    for (const description of descriptions) {
      const result = await CapabilityRepository.findOrCreate(description);
      capabilities.push(result[0]);
    }
    return capabilities;
  },
  findAll: async () =>
    Capability.findAll(),
  deleteByCode: async (code: string) => {
    const transaction = await Database.transaction();
    try {
      await ApplicantCapability.destroy({ where: { capabilityUuid: code }, transaction});
      const careerDestroyed = await Capability.destroy({ where: { code }, transaction });
      await transaction.commit();
      return careerDestroyed;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  truncate: async () =>
    Capability.truncate({ cascade: true })
};
