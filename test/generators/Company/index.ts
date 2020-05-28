import { companiesWithMinimumData } from "./companiesWithMinimumData";
import { Company, CompanyRepository, ICompany } from "../../../src/models/Company";
import { CustomGenerator } from "../types";

export type TCompanyGenerator = CustomGenerator<Promise<Company>>;
export type TCompanyDataGenerator = CustomGenerator<ICompany>;

export const CompanyGenerator = {
  withMinimumData: function*(): TCompanyGenerator {
    for (const companyData of companiesWithMinimumData) {
      yield CompanyRepository.create(companyData);
    }
    throw new Error("There are no more companies to generate");
  },
  completeData: function*(): TCompanyDataGenerator {
    for (const companyData of companiesWithMinimumData) {
      yield {
        ...companyData,
        slogan: "Lo mejor está llegando",
        description: "description",
        logo: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA AgICAgICAgICAgICAgIA==",
        website: "https://jobs.mercadolibre.com/",
        email: "jobs@mercadolibre.com",
        phoneNumbers: ["1143076222", "1159821999", "1143336666", "1143337777"],
        photos: [
          "https://miro.medium.com/max/11520/1*Om-snCmpOoI5vehnF6FBlw.jpeg",
          "https://pbs.twimg.com/media/EK_OWQEWwAIwDXr.jpg"
        ]
      };
    }
    throw new Error("There are no more companies to generate");
  }
};
