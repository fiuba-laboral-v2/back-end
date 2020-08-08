import { withMinimumData } from "./withMinimumData";
import { completeData } from "./completeData";
import { CompanyRepository } from "$models/Company";
import { Admin } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

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
    updatedWithStatus: async (variables?: IUpdatedWithStatus) => {
      const company = await CompanyRepository.create(withMinimumData(CompanyGenerator.getIndex()));
      if (!variables) return company;
      const { admin, status } = variables;
      return CompanyRepository.updateApprovalStatus(admin.userUuid, company.uuid, status);
    }
  },
  data: {
    completeData: () => completeData(CompanyGenerator.getIndex())
  }
};
