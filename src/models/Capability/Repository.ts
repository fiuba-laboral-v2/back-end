import { ICapability, Capability } from "./index";
import { Op } from "sequelize";

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
  deleteByCode: async (code: string) =>
    Capability.destroy({ where: { code } }),
  truncate: async () =>
    Capability.destroy({ truncate: true })
};
