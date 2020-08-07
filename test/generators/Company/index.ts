import { withMinimumData } from "./withMinimumData";
import { completeData } from "./completeData";
import { GenericGenerator, TGenericGenerator } from "../GenericGenerator";
import { CompanyRepository, ICompany } from "$models/Company";
import { CustomGenerator } from "../types";
import { Admin, Company } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

export type TCompanyGenerator = CustomGenerator<Promise<Company>>;
export type TUpdateCompanyGenerator = TGenericGenerator<Promise<Company>, IUpdatedWithStatus>;
export type TCompanyDataGenerator = CustomGenerator<ICompany>;
interface IUpdatedWithStatus {
  admin: Admin;
  status: ApprovalStatus;
}

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
    },
    updatedWithStatus: async ():  Promise<TUpdateCompanyGenerator> => {
      const generator = GenericGenerator<Promise<Company>, IUpdatedWithStatus>(
        async (index, variables) => {
          const company = await CompanyRepository.create(withMinimumData(index));
          if (!variables) return company;
          const { admin, status } = variables;
          return CompanyRepository.updateApprovalStatus(admin.userUuid, company.uuid, status);
        }
      );
      await generator.next();
      return generator;
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
