import faker from "faker";
import { omit } from "lodash";

const OfferMocks = {
  completeData: (companyId?: number) => {
    const minimumSalary = faker.random.number();
    return (
      {
        companyId: companyId,
        title: faker.name.title(),
        description: faker.lorem.sentence(),
        hoursPerDay: faker.random.number(),
        minimumSalary: minimumSalary,
        maximumSalary: minimumSalary + 1000
      }
    );
  },
  offerWithoutProperty: (companyId: number, property: string) => {
    return omit(OfferMocks.completeData(companyId), [property]);
  }
};

export { OfferMocks };
