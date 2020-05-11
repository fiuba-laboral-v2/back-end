import faker from "faker";
import { omit } from "lodash";
import { IOffer } from ".././../../src/models/Offer/Interface";
import { IOfferSection } from ".././../../src/models/Offer/OfferSection/Interface";
import { IOfferCareer } from ".././../../src/models/Offer/OfferCareer/Interface";

export type TOfferNumbersProperties = "hoursPerDay" | "minimumSalary" | "maximumSalary";

const OfferMocks = {
  completeData: (
    companyUuid: string,
    sections?: IOfferSection[],
    careers?: IOfferCareer[]
  ): IOffer => {
    const minimumSalary: number = faker.random.number();
    const data = {
      companyUuid: companyUuid || "",
      title: faker.name.title() as string,
      description: faker.lorem.sentence() as string,
      hoursPerDay: faker.random.number() as number,
      minimumSalary: minimumSalary,
      maximumSalary: minimumSalary + 1000,
      sections: sections,
      careers: careers
    };
    if (!sections) delete data.sections;
    if (!careers) delete data.careers;
    return data;
  },
  withOneSectionButNullCompanyId: () => {
    const attributes = OfferMocks.withOneSection("null");
    delete attributes.companyUuid;
    return attributes;
  },
  withSectionWithNoTitle: (companyUuid: string) => {
    const data = OfferMocks.withOneSection(companyUuid);
    delete data.sections![0].title;
    return data;
  },
  withOneSection: (companyUuid: string) => (
    OfferMocks.completeData(
      companyUuid,
      [
        {
          title: faker.random.words(),
          text: faker.lorem.paragraphs(),
          displayOrder: 1
        }
      ]
    )
  ),
  withOneCareer: (companyUuid: string, careerCode: string) => (
    OfferMocks.completeData(companyUuid, undefined, [{ careerCode: careerCode }])
  ),
  withOneCareerWithNullCareerCode: (companyUuid: string) => {
    const careerAttributes = { careerCode: "null" };
    delete careerAttributes.careerCode;
    return OfferMocks.completeData(companyUuid, undefined, [careerAttributes]);
  },
  withOneCareerAndOneSection: (companyUuid: string, careerCode: string) => (
    OfferMocks.completeData(
      companyUuid,
      [
        {
          title: faker.random.words(),
          text: faker.lorem.paragraphs(),
          displayOrder: 1
        }
      ],
      [
        {
          careerCode: careerCode
        }
      ]
    )
  ),
  withNoCompanyId: () =>
    ({
      title: "title",
      description: "description",
      hoursPerDay: 8,
      minimumSalary: 100,
      maximumSalary: 200
    }),
  withObligatoryData: (companyUuid: string) => OfferMocks.completeData(companyUuid),
  offerWithoutProperty: (companyUuid: string, property: string) =>
    omit(OfferMocks.completeData(companyUuid), [property]),
  offerWithNegativeNumberProperty: (
    companyUuid: string,
    property: TOfferNumbersProperties,
    value: number) => {
    const data = OfferMocks.completeData(companyUuid);
    data[property] = value;
    return data;
  },
  offerWithSpecificSalaryRange: (
    companyUuid: string,
    minimumSalary: number,
    maximumSalary: number
  ) => {
    const data = OfferMocks.completeData(companyUuid);
    data.minimumSalary = minimumSalary;
    data.maximumSalary = maximumSalary;
    return data;
  }
};

export { OfferMocks };
