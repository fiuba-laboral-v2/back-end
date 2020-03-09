import { ICapability } from "../../../src/models/Capability";
import faker from "faker";

const capabilityMocks = {
  capabilityData: () => ({
    uuid: "faker.random",
    description: faker.random.words()
  }),
  capabilitiesData: (size: number) => {
    const descriptions: ICapability[] = [];
    for (let i = 0; i < size ; i++) {
      descriptions.push(capabilityMocks.capabilityData());
    }
    return descriptions;
  }
};

export { capabilityMocks };
