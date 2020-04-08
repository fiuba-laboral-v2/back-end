import faker from "faker";
import { omit } from "lodash";
import { IOffer } from ".././../../src/models/Offer/Interface";
import { IOfferSection } from ".././../../src/models/Offer/OfferSection/Interface";

export type TOfferNumbersProperties = "hoursPerDay" | "minimumSalary" | "maximumSalary";

const OfferMocks = {
  completeData: (companyId?: number, sections?: IOfferSection[]): IOffer => {
    const minimumSalary = faker.random.number();
    const data = {
      companyId: companyId,
      title: faker.name.title(),
      description: faker.lorem.sentence(),
      hoursPerDay: faker.random.number(),
      minimumSalary: minimumSalary,
      maximumSalary: minimumSalary + 1000,
      sections: sections
    };
    if (!sections) return omit(data, ["sections"]);
    return data;
  },
  withOneSection: (companyId: number) => (
    OfferMocks.completeData(
      companyId,
      [
        {
          title: faker.random.words(),
          text: faker.lorem.paragraphs(),
          displayOrder: 1
        }
      ]
    )
  ),
  withNoCompanyId: () => OfferMocks.completeData(),
  withObligatoryData: (companyId: number) => OfferMocks.completeData(companyId),
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
