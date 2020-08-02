import { ICapability } from "./index";
import { Capability } from "..";

export const CapabilityRepository = {
  create: async ({ description }: ICapability) => {
    const capability = new Capability({ description });
    return capability.save();
  },
  findAll: () => Capability.findAll(),
  findOrCreate: async (description: string) => {
    const [capability] = await Capability.findOrCreate({ where: { description } });
    return capability;
  },
  findOrCreateByDescriptions: async (descriptions: string[] = []) => {
    const capabilities: Capability[] = [];
    for (const description of descriptions) {
      capabilities.push(await CapabilityRepository.findOrCreate(description));
    }
    return capabilities;
  },
  truncate: () => Capability.truncate({ cascade: true })
};
