import faker from "faker";
import { omit } from "lodash";

export type TOfferNumbersProperties = "hoursPerDay" | "minimumSalary" | "maximumSalary";

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
  offerWithoutProperty: (companyId: number, property: string) =>
    omit(OfferMocks.completeData(companyId), [property]),
  offerWithNegativeNumberProperty: (
    companyId: number,
    property: TOfferNumbersProperties,
    value: number) => {
    const data = OfferMocks.completeData(companyId);
    data[property] = value;
    return data;
  },
  offerWithSpecificSalaryRange: (
    companyId: number,
    minimumSalary: number,
    maximumSalary: number
  ) => {
    const data = OfferMocks.completeData(companyId);
    data.minimumSalary = minimumSalary;
    data.maximumSalary = maximumSalary;
    return data;
  }
};

export { OfferMocks };
