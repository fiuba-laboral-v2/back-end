import { GraphQLCapability } from "../Types/Capability";
import { List } from "$graphql/fieldTypes";
import { CapabilityRepository } from "$models/Capability";

const getCapabilities = {
  type: List(GraphQLCapability),
  resolve: async () => CapabilityRepository.findAll(),
};

export { getCapabilities };
