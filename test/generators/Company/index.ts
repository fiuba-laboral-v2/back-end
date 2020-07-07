import { withMinimumData } from "./withMinimumData";
import { completeData } from "./completeData";
import { CompanyRepository, ICompany } from "../../../src/models/Company";
import { CustomGenerator } from "../types";
import { Company } from "../../../src/models";

export type TCompanyGenerator = CustomGenerator<Promise<Company>>;
export type TCompanyDataGenerator = CustomGenerator<ICompany>;

export const CompanyGenerator = {
  instance: {
    withMinimumData: function*(): TCompanyGenerator {
      let index = 0;
      while (true) {
        yield CompanyRepository.create(withMinimumData(index));
        index++;
      }
    },
    withCompleteData: function*(): TCompanyGenerator {
      let index = 0;
      while (true) {
        yield CompanyRepository.create(completeData(index));
        index++;
      }
    }
  },
  data: {
    completeData: function*(): TCompanyDataGenerator {
      let index = 0;
      while (true) {
        yield completeData(index);
        index++;
      }
    }
  }
};
