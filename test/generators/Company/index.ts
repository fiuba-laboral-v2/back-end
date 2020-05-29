import { withMinimumData } from "./withMinimumData";
import { completeData } from "./completeData";
import { Company, CompanyRepository, ICompany } from "../../../src/models/Company";
import { CustomGenerator, IMaximum } from "../types";

export type TCompanyGenerator = CustomGenerator<Promise<Company>>;
export type TCompanyDataGenerator = CustomGenerator<ICompany>;

export const CompanyGenerator = {
  withMinimumData: function*({ maximum = 20 }: IMaximum = { maximum: 20 }): TCompanyGenerator {
    for (let index = 0; index < maximum; index++) {
      yield CompanyRepository.create(withMinimumData(index));
    }
    throw new Error("There are no more companies to generate");
  },
  completeData: function*({ maximum = 20 }: IMaximum = { maximum: 20 }): TCompanyDataGenerator {
    for (let index = 0; index < maximum; index++) {
      yield completeData(index);
    }
    throw new Error("There are no more companies to generate");
  }
};
