import { withMinimumData } from "./withMinimumData";
import { completeData } from "./completeData";
import { Company, CompanyRepository, ICompany } from "../../../src/models/Company";
import { CustomGenerator } from "../types";

export type TCompanyGenerator = CustomGenerator<Promise<Company>>;
export type TCompanyDataGenerator = CustomGenerator<ICompany>;

export const CompanyGenerator = {
  withMinimumData: function*(): TCompanyGenerator {
    let index = 0;
    while (true) {
      yield CompanyRepository.create(withMinimumData(index));
      index++;
    }
  },
  completeData: function*(): TCompanyDataGenerator {
    let index = 0;
    while (true) {
      yield completeData(index);
      index++;
    }
  }
};
