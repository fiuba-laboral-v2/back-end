import { ICapability, Capability } from "./index";
import { Op } from "sequelize";

export const CapabilityRepository = {
  create: async ({ description }: ICapability) => {
    const capability: Capability = new Capability({ description });
    return capability.save();
  },
  findByDescription: async (description: string[])  =>
    Capability.findAll({ where: { description: { [Op.or]: description }} }),
  findOrCreateMany: async (descriptions: string[] = [])  =>
    descriptions.map(async description => {
      const capability = await Capability.findOrCreate({ where: { description } });
      return capability[0];
    }),
  findAll: async () =>
    Capability.findAll(),
  deleteByCode: async (code: string) =>
    Capability.destroy({ where: { code } }),
  truncate: async () =>
    Capability.destroy({ truncate: true })
};
