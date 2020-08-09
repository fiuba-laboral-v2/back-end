import { IApplicantInputData, withMinimumData } from "./withMinimumData";
import { ApplicantRepository } from "$models/Applicant";
import { Admin } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

interface IUpdatedWithStatus {
  admin: Admin;
  status: ApprovalStatus;
}

export const ApplicantGenerator = {
  index: 0,
  getIndex: () => {
    ApplicantGenerator.index += 1;
    return ApplicantGenerator.index;
  },
  instance: {
    withMinimumData: (variables?: IApplicantInputData) =>
      ApplicantRepository.create(withMinimumData({
        index: ApplicantGenerator.getIndex(),
        ...variables
      })),
    updatedWithStatus: async (variables?: IUpdatedWithStatus) => {
      const applicant = await ApplicantRepository.create(
        withMinimumData({ index: ApplicantGenerator.getIndex() })
      );
      if (!variables) return applicant;
      const { admin, status } = variables;
      return ApplicantRepository.updateApprovalStatus(admin.userUuid, applicant.uuid, status);
    }
  },
  data: {
    minimum: () => withMinimumData({ index: ApplicantGenerator.getIndex() })
  }
};
