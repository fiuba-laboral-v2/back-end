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
  findOrCreate: async (description: string) => {
    const [ capability ] = await Capability.findOrCreate({ where: { description } });
    return capability;
  },
  findOrCreateByDescriptions: async (descriptions: string[] = []) => {
    const capabilities: Capability[] = [];
    for (const description of descriptions) {
      capabilities.push(await CapabilityRepository.findOrCreate(description));
    }
    return capabilities;
  },
  findAll: async () =>
    Capability.findAll(),
  deleteByCode: async (code: string) => {
    const transaction = await Database.transaction();
    try {
      await ApplicantCapability.destroy({ where: { capabilityUuid: code }, transaction});
      await Capability.destroy({ where: { code }, transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error(error);
    }
  },
  truncate: async () =>
    Capability.truncate({ cascade: true })
};
