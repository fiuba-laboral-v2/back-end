import { IOffer } from "../../../../src/models/Offer";
import { Career } from "../../../../src/models/Career";
import { Company } from "../../../../src/models/Company";

import { GraphQLResponse } from "../../ResponseSerializers";

const saveOfferWithCompleteData = async (
  attributes: IOffer,
  careers: Career[],
  company: Company
) => (
  {
    title: attributes.title,
    description: attributes.description,
    hoursPerDay: attributes.hoursPerDay,
    minimumSalary: attributes.minimumSalary,
    maximumSalary: attributes.maximumSalary,
    sections: attributes.sections
      .map(({ title, text, displayOrder }) => ({ title, text, displayOrder })),
    careers: careers.map(career => GraphQLResponse.career.getCareerByCode(career)),
    company: await GraphQLResponse.company.getCompanyById(company)
  }
);

export { saveOfferWithCompleteData };
