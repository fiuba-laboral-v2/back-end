import { withMinimumData } from "./withMinimumData";
import { completeData } from "./completeData";
import { GenericGenerator, TGenericGenerator } from "../GenericGenerator";
import { CompanyRepository } from "$models/Company";
import { CustomGenerator } from "../types";
import { Admin, Company } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

export type TCompanyGenerator = CustomGenerator<Promise<Company>>;
export type TUpdateCompanyGenerator = TGenericGenerator<Promise<Company>, IUpdatedWithStatus>;
interface IUpdatedWithStatus {
  admin: Admin;
  status: ApprovalStatus;
}

export const CompanyGenerator = {
  index: 0,
  getIndex: () => {
    CompanyGenerator.index += 1;
    return CompanyGenerator.index;
  },
  instance: {
    withMinimumData: () =>
      CompanyRepository.create(withMinimumData(CompanyGenerator.getIndex())),
    withCompleteData: () =>
      CompanyRepository.create(completeData(CompanyGenerator.getIndex())),
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
    completeData: () => completeData(CompanyGenerator.getIndex())
  }
};
